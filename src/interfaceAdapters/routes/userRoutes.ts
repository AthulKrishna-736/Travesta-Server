import { inject, injectable } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, createUserSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, googleLoginSchema, updateUserSchema } from "../../shared/types/zodValidation";
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
    ) {
        super();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        //authentication
        this.router
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res, next) => this._authController.register(req, res, next))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res, next) => this._authController.login(req, res, next))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res, next) => this._authController.loginGoogle(req, res, next))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res, next) => this._authController.verifyOTP(req, res, next))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res, next) => this._authController.resendOtp(req, res, next))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res, next) => this._authController.forgotPassword(req, res, next))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res, next) => this._authController.updatePassword(req, res, next))
            .post('/auth/logout', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._authController.logout(req, res, next))

        //profile
        this.router.route('/profile')
            .put(authMiddleware, authorizeRoles('user'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res, next) => this._userController.updateProfile(req, res, next))
            .get(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._userController.getProfile(req, res, next));

        //hotels
        this.router
            .get('/hotel/:hotelId/details/:roomId', (req: CustomRequest, res, next) => this._hotelController.getHotelDetailsWithRoom(req, res, next))
            .get('/hotels', (req: CustomRequest, res, next) => this._hotelController.getAllHotelsToUser(req, res, next))
            .get('/hotels/:hotelId', (req: CustomRequest, res, next) => this._hotelController.getHotelById(req, res, next))

        //rooms
        this.router
            .get('/room/:roomId', (req: CustomRequest, res, next) => this._roomController.getRoomById(req, res, next))

        //chat
        this.router
            .get('/chat/access', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getchatAccess(req, res, next))
            .get('/chat/vendors', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getVendorsChatWithUser(req, res, next))
            .get('/chat/unread', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getUnreadMsg(req, res, next))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next))

        // booking
        this.router.route('/bookings')
            .get(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.getBookingsByUser(req, res, next))

        this.router
            .delete('/booking/:bookingId', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.cancelBooking(req, res, next))

        //amenities
        this.router.route('/amenities')
            .get((req: CustomRequest, res, next) => this._amenityController.getUsedActiveAmenities(req, res, next));

        //subscription
        this.router
            .get('/plans', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._subscriptionController.getActiveSubscriptions(req, res, next))
            .get('/plans/active', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._subscriptionController.getUserActivePlan(req, res, next))
            .post('/plans/cancel', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._subscriptionController.cancelUserSubscription(req, res, next))


        // wallet
        this.router.route('/wallet')
            .post(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.createWallet(req, res, next))
            .get(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.getWallet(req, res, next))
            .put(authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.AddMoneyTransaction(req, res, next))

        this.router
            .post('/payment/online', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.createPaymentIntent(req, res, next))
            .post('/payment/:vendorId/booking', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.BookingConfirmTransaction(req, res, next))
            .post('/payment/:planId/subscribe', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.subscriptionConfirmTransaction(req, res, next))

        this.router
            .get('/transactions', authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.getTransactions(req, res, next));

        //rating
        this.router.route('/rating')
            .post(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._ratingController.createRating(req, res, next))
            .put(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._ratingController.updateRating(req, res, next))

        //coupons
        this.router
            .get('/coupons/:vendorId', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._couponController.getUserCoupons(req, res, next))
    }
}