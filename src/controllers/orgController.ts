import dbClient from "../databases/mongodb";
import type { Request, Response } from "express";
import type { OrganizationAddMemberPayload } from "../types/organizations";
import {
	OrganizationPayloadSchema,
	OrganizationUpdatePayloadSchema,
	OrganizationAddMemberSchema,
} from "../types/organizations";
import { ObjectId } from "mongodb";

export default class OrgController {
	static async createOrganization(req: Request, res: Response) {
		// passed from authGaurd
		// @ts-ignore
		const userId = req.userId as string;

		if (!userId) {
			return res.status(400).json({
				error: "no user id specefied",
			});
		}

		const payload = req.body;
		const parseResults = OrganizationPayloadSchema.safeParse(payload);

		if (!parseResults.success) {
			return res.status(401).json({
				error: "invalid organization payload",
				validations: parseResults.error.errors,
			});
		}

		const { name, description } = parseResults.data;

		const result = await dbClient.organizationCollection?.insertOne({
			name,
			description,
			owner: new ObjectId(userId), // for quick access insead of search on members
			organization_members: [
				{ id: new ObjectId(userId), access_level: "owner" },
			],
		});

		if (!result?.acknowledged) {
			return res
				.status(500)
				.json({ error: "failed to create an organization" });
		}

		return res.status(201).json({ organization_id: result.insertedId });
	}

	static async getAllJoinedOrganizations(req: Request, res: Response) {
		// @ts-ignore
		const userId = req.userId;

		if (!userId) {
			return res.status(400).json({
				error: "can't get user id",
			});
		}

		const organizations = await dbClient.organizationCollection
			?.aggregate([
				{
					$match: {
						organization_members: {
							$elemMatch: { id: new ObjectId(userId) },
						},
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "owner",
						foreignField: "_id",
						as: "owner",
					},
				},
				{ $unwind: "$owner" },
				{
					$lookup: {
						from: "users",
						localField: "organization_members.id",
						foreignField: "_id",
						as: "member_details",
					},
				},
				{
					$addFields: {
						"owner.id": "$owner._id",
					},
				},
				{
					$addFields: {
						organization_members: {
							$map: {
								input: "$organization_members",
								as: "member",
								in: {
									$mergeObjects: [
										"$$member",
										{
											$arrayElemAt: [
												{
													$filter: {
														input: "$member_details",
														as: "detail",
														cond: { $eq: ["$$detail._id", "$$member.id"] },
													},
												},
												0,
											],
										},
									],
								},
							},
						},
					},
				},
				{
					$project: {
						"owner._id": 0,
						"owner.password": 0,
						"organization_members._id": 0,
						"organization_members.password": 0,
						member_details: 0,
					},
				},
			])
			.toArray();

		return res.status(200).json(organizations);
	}

	static async getOrganization(req: Request, res: Response) {
		// passed from org middleware
		// @ts-ignore
		const organizationId = req.organizationId as ObjectId;

		console.log(organizationId);

		const organization = await dbClient.organizationCollection
			?.aggregate([
				{
					$match: { _id: organizationId },
				},
				{
					$lookup: {
						from: "users",
						localField: "owner",
						foreignField: "_id",
						as: "owner",
					},
				},
				{ $unwind: "$owner" },
				{
					$lookup: {
						from: "users",
						localField: "organization_members.id",
						foreignField: "_id",
						as: "member_details",
					},
				},
				{
					$addFields: {
						"owner.id": "$owner._id",
					},
				},
				{
					$addFields: {
						organization_members: {
							$map: {
								input: "$organization_members",
								as: "member",
								in: {
									$mergeObjects: [
										"$$member",
										{
											$arrayElemAt: [
												{
													$filter: {
														input: "$member_details",
														as: "detail",
														cond: { $eq: ["$$detail._id", "$$member.id"] },
													},
												},
												0,
											],
										},
									],
								},
							},
						},
					},
				},
				{
					$project: {
						"owner._id": 0,
						"owner.password": 0,
						"organization_members._id": 0,
						"organization_members.password": 0,
						member_details: 0,
					},
				},
			])
			.toArray();

		return res.status(200).json(organization[0]);
	}

	static async updateOrganization(req: Request, res: Response) {
		// @ts-ignore
		const organizationId = req.organizationId as string;
		const payload = req.body;
		const parseResults = OrganizationUpdatePayloadSchema.safeParse(payload);

		if (!parseResults.success) {
			return res.status(401).json({
				error: "invalid update workspace payload",
				validations: parseResults.error.errors,
			});
		}

		const changes = parseResults.data as { [key: string]: string };

		// if no changes do nothing
		if (Object.keys(changes).length === 0) {
			return res.status(401).json({ error: "nothing given to change" });
		}

		const updateResults = await dbClient.organizationCollection?.updateOne(
			{
				_id: new ObjectId(organizationId),
			},
			{
				$set: changes,
			},
		);

		if (updateResults?.acknowledged) {
			return res.status(201).json({
				organization_id: organizationId,
				...changes,
			});
		}

		return res.status(500).json({ error: "failed to update organization" });
	}

	static async deleteOrganization(req: Request, res: Response) {
		// @ts-ignore
		const organizationId = req.organizationId as string;

		const deleteResults = await dbClient.organizationCollection?.deleteOne({
			_id: new ObjectId(organizationId),
		});

		if (deleteResults?.acknowledged) {
			return res.status(200).json({ message: "successfully deleted" });
		}

		return res.status(500).json({ error: "failed to delete organization" });
	}

	static async addMember(req: Request, res: Response) {
		// @ts-ignore
		const organizationId: string | undefined = req.organizationId;
		const payload: OrganizationAddMemberPayload | undefined = req.body;

		const parseResults = OrganizationAddMemberSchema.safeParse(payload);

		if (!parseResults.success) {
			return res.status(401).json({
				error: "invalid add member payload",
				validations: parseResults.error.errors,
			});
		}

		const { user_email } = payload as OrganizationAddMemberPayload;

		const member = await dbClient.userCollection?.findOne({
			email: user_email,
		});

		if (!member) {
			return res
				.status(401)
				.json({ error: "can't find user with passed email" });
		}

		const updateResult = await dbClient.organizationCollection?.updateOne(
			{ _id: new ObjectId(organizationId) },
			{
				$addToSet: {
					organization_members: { id: member._id, access_level: "member" },
				},
			},
		);

		if (!updateResult?.acknowledged) {
			return res.status(500).json({
				error: "can't add member",
			});
		}

		return res.status(201).json({
			message: "added",
		});
	}
}
