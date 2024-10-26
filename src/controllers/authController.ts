import type { Request, Response } from "express";
import type { UserCredentials } from "../types/user";
import type { JwtPayload } from "jsonwebtoken";
import { UserCredentialsSchema } from "../types/user";
import { validateCredentials } from "../utils/helpers";
import jwt from "jsonwebtoken";
import {
	ACCESS_TOKEN_SECRET,
	ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_SECRET,
	REFRESH_TOKEN_EXPIRES_IN,
} from "../utils/constants";
import redisClient from "../databases/redis";

export default class AuthController {
	static async login(req: Request, res: Response): Promise<void> {
		const payload = req.body as UserCredentials;

		const parseResults = UserCredentialsSchema.safeParse(payload);

		if (!parseResults.success) {
			res.status(400).send({
				error: "invalid login payload",
				validation: parseResults.error.errors,
			});
      return;
		}

		const user = await validateCredentials(payload);

		if (!user) {
			res.status(400).send({
				error: "invalid email or password",
			});
      return;
		}

		const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
			expiresIn: ACCESS_TOKEN_EXPIRES_IN,
		});

		const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		});

		res.status(200).send({
			message: "Done",
			accessToken,
			refreshToken,
		});
	}

	static async refresh(req: Request, res: Response): Promise<void> {
		const refreshToken: string | undefined = req.body.refresh_token;

		if (!refreshToken) {
			res.status(401).send({
				error: "can't find refresh token",
			});
      return;
		}

		try {
			const payload = jwt.verify(
				refreshToken,
				REFRESH_TOKEN_SECRET,
			) as JwtPayload;

			const userId: string = payload.userId;

			const isRevoked = await redisClient.isTokenRevoked(userId, refreshToken);

			if (isRevoked) {
				res.status(403).json({
					error: "revoked refresh token",
				});
        return;
			}

			const newAccessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
				expiresIn: ACCESS_TOKEN_EXPIRES_IN,
			});

			const newRefreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
				expiresIn: REFRESH_TOKEN_EXPIRES_IN,
			});

			res.status(201).send({
				message: "created",
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			});

		} catch (err) {
			res.status(403).send({
				error: (err as Error).message,
			});
		}
	}

	static async revokeRefreshToken(req: Request, res: Response): Promise<void> {
		const refreshToken: string | undefined = req.body.refresh_token;

		if (!refreshToken) {
			res.status(401).json({
				error: "no token passed",
			});
      return;
		}

		let userId: string;
		let payload: JwtPayload;

		try {
			payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;
			userId = payload.userId;
		} catch (err) {
			res.status(401).json({ error: (err as Error).message });
      return;
		}

		const expTime = payload.exp as number;
		const currentTime = Math.floor(Date.now() / 1000);

		const remainingTime = expTime - currentTime;

		redisClient.revokeToken(userId, refreshToken, remainingTime);

		res.status(201).json({
			message: "Done",
		});
	}
}
