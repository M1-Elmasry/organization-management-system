import type { ObjectId } from "mongodb";
import { z } from "zod";

export const OrganizationPayloadSchema = z.object({
	name: z.string().min(3),
	description: z.string(),
});

export const OrganizationUpdatePayloadSchema = z.object({
	name: z.string().min(3).optional(),
	description: z.string().optional(),
});

export type OrganizationPayload = z.infer<typeof OrganizationPayloadSchema>;
export type OrganizationUpdatePayload = z.infer<
	typeof OrganizationUpdatePayloadSchema
>;

export type orgMember = {
  id: ObjectId,
  access_level: "owner" | "member"
}

export type OrganizationDocument = OrganizationPayload & {
	owner: ObjectId;
	organization_members: orgMember[];
};

export const OrganizationAddMemberSchema = z.object({
	user_email: z.string().email("member's email is not valid"),
});

export type OrganizationAddMemberPayload = z.infer<
	typeof OrganizationAddMemberSchema
>;
