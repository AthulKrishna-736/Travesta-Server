import { container } from "tsyringe";
import { AdminController } from "../controllers/adminController";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, subscriptionSchema } from "../../shared/types/zodValidation";
import { CustomRequest } from "../../utils/customRequest";
import { authMiddleware } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { AuthController } from "../controllers/authController";
import { AmenityController } from "../controllers/amenityController";
import { SubscriptionController } from "../controllers/subscriptionController";
import { ChatController } from "../controllers/chatController";

export class adminRoutes extends BaseRouter {
    private _authController: AuthController;
    private _adminController: AdminController;
    private _amenityController: AmenityController;
    private _subscriptionController: SubscriptionController;
    private _chatController: ChatController;

    constructor() {
        super();
        this._authController = container.resolve(AuthController);
        this._adminController = container.resolve(AdminController);
        this._amenityController = container.resolve(AmenityController);
        this._subscriptionController = container.resolve(SubscriptionController);
        this._chatController = container.resolve(ChatController);
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this._authController.login(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._authController.logout(req, res))

            .get('/users', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._adminController.getAllUsers(req, res))
            .patch('/users/:userId/block-toggle', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._adminController.blockOrUnblockUser(req, res))

            .get('/vendor-requests', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._adminController.getVendorRequest(req, res))
            .patch('/vendor/:vendorId/verify', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._adminController.updateVendorReq(req, res));

        this.router
            .post("/amenities", authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._amenityController.createAmenity(req, res))
            .patch("/amenities/:id", authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._amenityController.updateAmenity(req, res))
            .patch("/amenities/:id/block-toggle", authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._amenityController.blockUnblockAmenity(req, res))
            .get("/amenities", authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._amenityController.getAllAmenities(req, res))
            .get("/amenities/active", authMiddleware, authorizeRoles("admin", "user", "vendor"), (req: CustomRequest, res) => this._amenityController.getAllActiveAmenities(req, res));

        this.router
            .get('/plans', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._subscriptionController.getAllSubscriptions(req, res))
            .get('/plans/active', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), (req: CustomRequest, res) => this._subscriptionController.getActiveSubscriptions(req, res))
            .post('/plans', authMiddleware, authorizeRoles('admin'), validateRequest(subscriptionSchema), (req: CustomRequest, res) => this._subscriptionController.createSubscriptionPlan(req, res))
            .patch('/plans/:planId', authMiddleware, authorizeRoles('admin'), validateRequest(subscriptionSchema), (req: CustomRequest, res) => this._subscriptionController.updateSubscriptionPlan(req, res))
            .patch('/plans/:planId/block-toggle', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._subscriptionController.blockUnblockSubscription(req, res));

        this.router
            .get('/chat-vendors', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this._chatController.getVendorsChatWithAdmin(req, res))
    }
}