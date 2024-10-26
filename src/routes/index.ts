import { Router } from "express";
import UserController from "../controllers/userController";
import AuthController from "../controllers/authController";
import OrgController from "../controllers/orgController";
import { authGuard } from "../middlewares/auth";
import { organizationGuard } from "../middlewares/organization";

const router = Router();

// Auth

router.post("/signup", UserController.createNewUser);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/revoke-refresh-token", AuthController.revokeRefreshToken);

// Organizations Operations

router.post("/organization", authGuard, OrgController.createOrganization);
router.get("/organization", authGuard, OrgController.getAllJoinedOrganizations);
router.get(
	"/organization/:organization_id",
	authGuard,
	organizationGuard(false),
	OrgController.getOrganization,
);
router.put(
	"/organization/:organization_id",
	authGuard,
	organizationGuard(true),
	OrgController.updateOrganization,
);
router.delete(
	"/organization/:organization_id",
	authGuard,
	organizationGuard(true),
	OrgController.deleteOrganization,
);
router.post(
	"/organization/:organization_id/invite",
	authGuard,
	organizationGuard(false),
	OrgController.addMember,
);

export default router;
