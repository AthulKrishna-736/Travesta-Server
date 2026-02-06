import { inject, injectable } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { checkUserBlock } from "../../middlewares/checkBlock";
import { upload } from "../../infrastructure/config/multer";
import { TOKENS } from "../../constants/token";
import { IUserController } from "../../domain/interfaces/controllers/userController.interface";
import { IAuthController } from "../../domain/interfaces/controllers/authController.interface";
import { IHotelController } from "../../domain/interfaces/controllers/hotelController.interface";
import { IChatController } from "../../domain/interfaces/controllers/chatController.interface";
import { IBookingController } from "../../domain/interfaces/controllers/bookingController.interface";
import { IAmenityController } from "../../domain/interfaces/controllers/amenityController.interface";
import { IWalletController } from "../../domain/interfaces/controllers/walletController.interface";
import { ISubscriptionController } from "../../domain/interfaces/controllers/subscriptionController.interface";
import { IRoomController } from "../../domain/interfaces/controllers/roomController.interface";
import { IRatingController } from "../../domain/interfaces/controllers/ratingController.interface";
import { ICouponController } from "../../domain/interfaces/controllers/couponController.interface";
import { INotificationController } from "../../domain/interfaces/controllers/notificationController.interface";
import { createUserSchema, forgotPassSchema, googleLoginSchema, loginSchema, resendOtpSchema, updatePassSchema, updateUserSchema, verifyOtp } from "../../shared/validations/authValidation.schema";
import { createPaymentIntentSchema, createWalletSchema } from "../../shared/validations/walletValidation.schema";
import { subscribeUserSchema } from "../../shared/validations/subscriptionValidation.schema";
import { createBookingSchema } from "../../shared/validations/roomValidation.schema";

@injectable()
export class userRoutes extends BaseRouter {
    constructor(
        @inject(TOKENS.AuthController) private _authController: IAuthController,
        @inject(TOKENS.UserController) private _userController: IUserController,
        @inject(TOKENS.HotelController) private _hotelController: IHotelController,
        @inject(TOKENS.RoomController) private _roomController: IRoomController,
        @inject(TOKENS.ChatController) private _chatController: IChatController,
        @inject(TOKENS.BookingController) private _bookingController: IBookingController,
        @inject(TOKENS.WalletController) private _walletController: IWalletController,
        @inject(TOKENS.AmenityController) private _amenityController: IAmenityController,
        @inject(TOKENS.SubscriptionController) private _subscriptionController: ISubscriptionController,
        @inject(TOKENS.RatingController) private _ratingController: IRatingController,
        @inject(TOKENS.CouponController) private _couponController: ICouponController,
        @inject(TOKENS.NotificationController) private _notificationController: INotificationController,
    ) {
        super();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        //authentication
        this.router
            .post('/signup', validateRequest(createUserSchema), (req: CustomRequest, res, next) => this._authController.register(req, res, next))
            .post('/login', validateRequest(loginSchema), (req: CustomRequest, res, next) => this._authController.login(req, res, next))
            .post('/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res, next) => this._authController.loginGoogle(req, res, next))
            .post('/otp/verify', validateRequest(verifyOtp), (req: CustomRequest, res, next) => this._authController.verifyOTP(req, res, next))
            .post('/otp/resend', validateRequest(resendOtpSchema), (req: CustomRequest, res, next) => this._authController.resendOtp(req, res, next))
            .post('/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res, next) => this._authController.forgotPassword(req, res, next))
            .patch('/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res, next) => this._authController.updatePassword(req, res, next))
            .post('/logout', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._authController.logout(req, res, next))

        //profile
        this.router.route('/profile')
            .put(authMiddleware, authorizeRoles('user'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res, next) => this._userController.updateProfile(req, res, next))
            .get(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._userController.getProfile(req, res, next));

        this.router
            .patch('/password', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, validateRequest(updatePassSchema), (req: CustomRequest, res, next) => this._authController.changePassword(req, res, next))

        //hotels
        this.router
            .get('/hotels', (req: CustomRequest, res, next) => this._hotelController.getAllHotelsToUser(req, res, next))
            .get('/hotels/trending', (req: CustomRequest, res, next) => this._hotelController.getTrendingHotels(req, res, next))
            .get('/hotels/:hotelId', (req: CustomRequest, res, next) => this._hotelController.getHotelById(req, res, next))
            .get('/hotels/:hotelId/rooms/:roomId', (req: CustomRequest, res, next) => this._hotelController.getHotelDetailsWithRoom(req, res, next))

        //rooms
        this.router
            .get('/rooms/:roomId', (req: CustomRequest, res, next) => this._roomController.getRoomById(req, res, next));

        //chat
        this.router
            .get('/chat/access', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getchatAccess(req, res, next))
            .get('/chat/vendors', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getVendorsChatWithUser(req, res, next))
            .get('/chat/unread', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getUnreadMsg(req, res, next))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next))
            .patch('/chat/messages/:messageId', authMiddleware, authorizeRoles('user', 'admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.readMessage(req, res, next))

        // booking
        this.router.route('/bookings')
            .get(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.getBookingsByUser(req, res, next))
            .post(authMiddleware, authorizeRoles('user'), checkUserBlock, validateRequest(createBookingSchema), (req: CustomRequest, res, next) => this._walletController.BookingConfirmTransaction(req, res, next));

        this.router
            .delete('/bookings/:bookingId', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.cancelBooking(req, res, next));

        //amenities
        this.router.route('/amenities')
            .get((req: CustomRequest, res, next) => this._amenityController.getUsedActiveAmenities(req, res, next));

        //subscription
        this.router.route('/plans')
            .get(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._subscriptionController.getActiveSubscriptions(req, res, next))
            .patch(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._subscriptionController.cancelUserSubscription(req, res, next))

        this.router
            .get('/plans/active', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._subscriptionController.getUserActivePlan(req, res, next))


        // wallet
        this.router.route('/wallets')
            .post(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, validateRequest(createWalletSchema), (req: CustomRequest, res, next) => this._walletController.createWallet(req, res, next))
            .get(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.getWallet(req, res, next))

        this.router
            .post('/payments/intent', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, validateRequest(createPaymentIntentSchema), (req: CustomRequest, res, next) => this._walletController.createPaymentIntent(req, res, next))
            .post('/payments/bookings', authMiddleware, authorizeRoles('user'), checkUserBlock, validateRequest(createBookingSchema), (req: CustomRequest, res, next) => this._walletController.BookingConfirmTransaction(req, res, next))
            .post('/payments/subscriptions', authMiddleware, authorizeRoles('user'), checkUserBlock, validateRequest(subscribeUserSchema), (req: CustomRequest, res, next) => this._walletController.subscriptionConfirmTransaction(req, res, next))

        this.router
            .get('/transactions', authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.getTransactions(req, res, next));

        //rating
        this.router.route('/ratings')
            .post(authMiddleware, authorizeRoles('user'), checkUserBlock, upload.array('images', 3), (req: CustomRequest, res, next) => this._ratingController.createRating(req, res, next))
            .put(authMiddleware, authorizeRoles('user'), checkUserBlock, upload.array('images', 3), (req: CustomRequest, res, next) => this._ratingController.updateRating(req, res, next))

        //coupons
        this.router
            .get('/coupons/:vendorId', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._couponController.getUserCoupons(req, res, next));

        //Notification
        this.router.route('/notifications')
            .get(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._notificationController.getUserNotification(req, res, next))
            .put(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._notificationController.markAllNotification(req, res, next))

        this.router
            .get('/notifications/events', authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._notificationController.getLiveNotification(req, res, next))
            .patch('/notifications/:notificationId', authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._notificationController.markNotification(req, res, next))
    }
}