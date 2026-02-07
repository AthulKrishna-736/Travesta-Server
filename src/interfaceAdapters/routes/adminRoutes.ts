import { inject, injectable } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { CustomRequest } from "../../utils/customRequest";
import { authMiddleware } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { TOKENS } from "../../constants/token";
import { IAuthController } from "../../domain/interfaces/controllers/authController.interface";
import { IAdminController } from "../../domain/interfaces/controllers/adminController.interface";
import { IAmenityController } from "../../domain/interfaces/controllers/amenityController.interface";
import { IChatController } from "../../domain/interfaces/controllers/chatController.interface";
import { ISubscriptionController } from "../../domain/interfaces/controllers/subscriptionController.interface";
import { loginSchema } from "../../shared/validations/authValidation.schema";
import { subscriptionSchema } from "../../shared/validations/subscriptionValidation.schema";
import { createAmenitySchema, updateAmenitySchema } from "../../shared/validations/amenitiesValidation.schema";

@injectable()
export class adminRoutes extends BaseRouter {
    constructor(
        @inject(TOKENS.AuthController) private _authController: IAuthController,
        @inject(TOKENS.AdminController) private _adminController: IAdminController,
        @inject(TOKENS.ChatController) private _chatController: IChatController,
        @inject(TOKENS.SubscriptionController) private _subscriptionController: ISubscriptionController,
        @inject(TOKENS.AmenityController) private _amenityController: IAmenityController,
    ) {
        super();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        //authentication
        this.router
            .post('/login', validateRequest(loginSchema), (req: CustomRequest, res, next) => this._authController.login(req, res, next))
            .post('/logout', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._authController.logout(req, res, next));

        //customers
        this.router
            .get('/users', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.getAllUsers(req, res, next))
            .patch('/users/:userId', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.blockOrUnblockUser(req, res, next));

        this.router
            .get('/vendors', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.getVendorRequest(req, res, next))
            .patch('/vendors/:vendorId', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.updateVendorReq(req, res, next));

        //amenities
        this.router.route('/amenities')
            .post(authMiddleware, authorizeRoles('admin'), validateRequest(createAmenitySchema), (req: CustomRequest, res, next) => this._amenityController.createAmenity(req, res, next))
            .get(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._amenityController.getAllAmenities(req, res, next));

        this.router.route('/amenities/:amenityId')
            .put(authMiddleware, authorizeRoles('admin'), validateRequest(updateAmenitySchema), (req: CustomRequest, res, next) => this._amenityController.updateAmenity(req, res, next))
            .patch(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._amenityController.blockUnblockAmenity(req, res, next));

        //subscription
        this.router.route('/plans')
            .get(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._subscriptionController.getAllSubscriptions(req, res, next))
            .post(authMiddleware, authorizeRoles('admin'), validateRequest(subscriptionSchema), (req: CustomRequest, res, next) => this._subscriptionController.createSubscriptionPlan(req, res, next))

        this.router.route('/plans/:planId')
            .put(authMiddleware, authorizeRoles('admin'), validateRequest(subscriptionSchema), (req: CustomRequest, res, next) => this._subscriptionController.updateSubscriptionPlan(req, res, next))
            .patch(authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._subscriptionController.blockUnblockSubscription(req, res, next));

        this.router
            .get('/plans/history', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._subscriptionController.getAllPlanHistory(req, res, next))

        //chat
        this.router
            .get('/chat/vendors', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._chatController.getVendorsChatWithAdmin(req, res, next))
            .get('/chat/unreads', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._chatController.getUnreadMsg(req, res, next))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next));

        this.router
            .get('/analytics', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res, next) => this._adminController.getAdminAnalytics(req, res, next))
    }
}