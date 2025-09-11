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
        //authentication
        this.router
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res, next) => this._authController.login(req, res, next))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._authController.logout(req, res, next));

        //customers
        this.router
            .get('/customers', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.getAllUsers(req, res, next))
            .patch('/customers/:customerId/status', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.blockOrUnblockUser(req, res, next))
            .get('/vendors/requests', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.getVendorRequest(req, res, next))
            .patch('/vendors/:vendorId/verify', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.updateVendorReq(req, res, next));

        //amenities
        this.router.route('/amenities')
            .post(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._amenityController.createAmenity(req, res, next))
            .get(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._amenityController.getAllAmenities(req, res, next))

        this.router.route('/amenities/:amenityId')
            .put(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._amenityController.updateAmenity(req, res, next))
            .patch(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._amenityController.blockUnblockAmenity(req, res, next));

        //subscription
        this.router.route('/plans')
            .get(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._subscriptionController.getAllSubscriptions(req, res, next))
            .post(authMiddleware, authorizeRoles('admin'), validateRequest(subscriptionSchema), (req: CustomRequest, res, next) => this._subscriptionController.createSubscriptionPlan(req, res, next))
        // .get('/plans/active', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), (req: CustomRequest, res, next) => this._subscriptionController.getActiveSubscriptions(req, res, next))

        this.router.route('/plans/:planId')
            .put(authMiddleware, authorizeRoles('admin'), validateRequest(subscriptionSchema), (req: CustomRequest, res, next) => this._subscriptionController.updateSubscriptionPlan(req, res, next))
            .patch(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._subscriptionController.blockUnblockSubscription(req, res, next));

        //chat
        this.router
            .get('/chat/vendors', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._chatController.getVendorsChatWithAdmin(req, res, next))
            .get('/chat/unread', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._chatController.getUnreadMsg(req, res, next))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next));
    }
}