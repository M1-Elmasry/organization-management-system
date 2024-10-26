import dbClient from "../databases/mongodb";
import type { Request, Response } from "express";
import type { UserDocument } from "../types/user";
import { UserSchema } from "../types/user";
import { isUserExists, hashPassword } from "../utils/helpers";

export default class UserController {
	static async createNewUser(req: Request, res: Response) {
		const payload = req.body as UserDocument;

		const parseResults = UserSchema.safeParse(payload);
		if (!parseResults.success) {
			return res.status(400).send({
				error: "invalid user payload",
				validation: parseResults.error.errors,
			});
		}

		const isExists = await isUserExists(payload.email);

		if (isExists) {
			return res.status(400).send({
				error: "email currently exists",
			});
		}

		const hashedPassword = hashPassword(payload.password);

		const results = await dbClient.userCollection?.insertOne({
			...payload,
			password: hashedPassword,
		});

		if (!results?.acknowledged) {
			return res.status(500).send({
				error: "can't write a new user",
			});
		}

		return res.status(201).json({ message: "Done" });
	}
}
