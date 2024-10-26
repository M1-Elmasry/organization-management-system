import dbClient from "../databases/mongodb";
import crypto from "crypto";
import type { WithId } from "mongodb";
import { ObjectId } from "mongodb";
import type { UserDocument, UserCredentials } from "../types/user";

export const isValidObjectId = (id: string): boolean => {
  try {
    return ObjectId.isValid(id);
  } catch (_) {
    return false;
  }
};

export async function isUserExists(email: string): Promise<boolean> {
	const user: WithId<UserDocument> | null | undefined =
		await dbClient.userCollection?.findOne({ email });
	return !!user;
}

export function hashPassword(password: string): string {
	const sha1 = crypto.createHash("sha1");
	sha1.update(password);
	return sha1.digest("hex");
}

export function validatePassword(
	password: string,
	hashedPassword: string,
): boolean {
	const hashed = hashPassword(password);
	return hashed === hashedPassword;
}

export async function validateCredentials({
	email,
	password,
}: UserCredentials): Promise<false | WithId<UserDocument>> {
	const user: WithId<UserDocument> | null | undefined =
		await dbClient.userCollection?.findOne({ email });

	if (!user) {
		return false;
	}

	const validPassword = validatePassword(password, user.password);

	if (!validPassword) {
		return false;
	}

	return user;
}
