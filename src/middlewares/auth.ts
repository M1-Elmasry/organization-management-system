import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dbClient from "../databases/mongodb";
import { ACCESS_TOKEN_SECRET } from "../utils/constants";
import type { JwtPayload } from "jsonwebtoken";

export async function authGuard(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const authHeader = req.header("Authorization");
	const values = authHeader?.split(" ");

	if (!values || values.length !== 2 || values[0] !== "Bearer") {
		res.status(401).json({ error: "Invalid authorization" });
		return;
	}

	const token = values[1];

	let userId: string | undefined;

	try {
		const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
		userId = payload.userId;
	} catch (err) {
		res.status(401).json({ error: (err as Error).message });
		return;
	}

	if (!userId || !ObjectId.isValid(userId)) {
		console.log(userId);
		res.status(401).json({ error: "Invalid token payload" });
		return;
	}

	const user = await dbClient.userCollection?.findOne({
		_id: new ObjectId(userId),
	});
	if (!user) {
		res.status(401).json({ error: "User not found" });
		return;
	}

	// @ts-ignore
	req.userId = userId;

	next();
}
