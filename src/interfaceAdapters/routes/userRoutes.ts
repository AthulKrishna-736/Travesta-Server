import { container } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, createUserSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, googleLoginSchema, updateUserSchema } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { AuthController } from "../controllers/authController";
import { checkUserBlock } from "../../middlewares/checkBlock";
import { UserController } from "../controllers/userController";
import { upload } from "../../infrastructure/config/multer";
import { HotelController } from "../controllers/hotelController";
import { ChatController } from "../controllers/chatController";
import { BookingController } from "../controllers/bookingController";
import { WalletController } from "../controllers/walletController";
import { AmenityController } from "../controllers/amenityController";

export class userRoutes extends BaseRouter {
    private _authController: AuthController;
    private _userController: UserController;
    private _hotelController: HotelController;
    private _chatController: ChatController;
    private _bookingController: BookingController;
    private _walletController: WalletController;
    private _amenityController: AmenityController;

    constructor() {
        super();
        this._authController = container.resolve(AuthController);
        this._userController = container.resolve(UserController);
        this._hotelController = container.resolve(HotelController);
        this._chatController = container.resolve(ChatController);
        this._bookingController = container.resolve(BookingController);
        this._walletController = container.resolve(WalletController);
        this._amenityController = container.resolve(AmenityController);
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
            .get('/hotels', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getAllHotelsToUser(req, res, next))
            .get('/hotels/:hotelId', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelById(req, res, next));

        //chat
        this.router
            .get('/chat/vendors', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getVendorsChatWithUser(req, res, next))
            .get('/chat/unread', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getUnreadMsg(req, res, next))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next))

        // booking
        this.router.route('/bookings')
            .post(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.createBooking(req, res, next))
            .get(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.getBookingsByUser(req, res, next))

        this.router
            .delete('/booking/:bookingId', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.cancelBooking(req, res, next))


        //amenities
        this.router.route('/amenities')
            .get(authMiddleware, authorizeRoles('user'), (req: CustomRequest, res, next) => this._amenityController.getUsedActiveAmenities(req, res, next));

        // wallet
        this.router.route('/wallet')
            .post(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.createWallet(req, res, next))
            .get(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.getWallet(req, res, next))
            .put(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.AddMoneyTransaction(req, res, next))

        this.router
            .post('/payment/online', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.createPaymentIntent(req, res, next))
            .post('/payment/:vendorId/booking', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.BookingConfirmTransaction(req, res, next))
        // .post subsciption payement

        this.router
            .get('/transactions', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._walletController.getTransactions(req, res, next));
    }
}