import type { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "../utils/helpers";
import dbClient from "../databases/mongodb";
import { ObjectId } from "mongodb";
import type { orgMember } from "../types/organizations";

export function organizationGuard(ownerRequired: boolean) {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // @ts-ignore
		const userId = req.userId as string;

    console.log(userId);

		if (!userId) {
			res
				.status(401)
				.json({ error: "must be used after AuthGuard middleware" });
      return;
		}

		const organizationId: string | undefined = req.params.organization_id;
		if (!organizationId) {
			res
				.status(400)
				.json({ error: "Please add organization_id param to the route path" });
      return;
		}

		if (!isValidObjectId(organizationId)) {
			res.status(400).json({ error: "Invalid organization ID" });
      return;
		}

		const organization = await dbClient.organizationCollection?.findOne({
			_id: new ObjectId(organizationId),
		});

		if (!organization) {
			res.status(404).json({ error: "Organization Not Found" });
      return;
		}

		const isMember = organization.organization_members.some(
			(member: orgMember) => member.id.toString() === userId,
		);
		if (!isMember) {
			res
				.status(403)
				.json({ error: "current user is not a member on this organization" });
      return;
		}

		// Validate if user is an owner if required
		if (ownerRequired && organization.owner.toString() !== userId) {
			res
				.status(403)
				.json({ error: "Forbidden: User is not the owner" });
      return;
		}
  
    // @ts-ignore
		req.organization = organization;
    // @ts-ignore
		req.organizationId = organization._id;


		next();
	};
}
