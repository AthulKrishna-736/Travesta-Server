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
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res) => this._authController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this._authController.login(req, res))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res) => this._authController.loginGoogle(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res) => this._authController.verifyOTP(req, res))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res) => this._authController.resendOtp(req, res))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res) => this._authController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res) => this._authController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._authController.logout(req, res))

        //profile
        this.router.route('/profile')
            .put(authMiddleware, authorizeRoles('user'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res) => this._userController.updateProfile(req, res))
            .get(authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._userController.getProfile(req, res));

        //hotels
        this.router
            .get('/hotels', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._hotelController.getAllHotels(req, res))
            .get('/hotels/:hotelId', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._hotelController.getHotelById(req, res));

        //chat
        this.router
            .get('/chat/vendors', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getVendorsChatWithUser(req, res))
            .get('/chat/unread', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getUnreadMsg(req, res))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getChatMessages(req, res))

        // booking
        this.router.route('/bookings')
            .post(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._bookingController.createBooking(req, res))
            .get(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._bookingController.getBookingsByUser(req, res))

        this.router
            .delete('/booking/:bookingId', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._bookingController.cancelBooking(req, res))


        //amenities
        this.router.route('/amenities')
            .get(authMiddleware, authorizeRoles('user'), (req: CustomRequest, res) => this._amenityController.getUsedActiveAmenities(req, res));

        // wallet
        this.router.route('/wallet')
            .post(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._walletController.createWallet(req, res))
            .get(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._walletController.getWallet(req, res))
            .put(authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._walletController.AddMoneyTransaction(req, res))

        this.router
            .post('/payment/online', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._walletController.createPaymentIntent(req, res))
            .post('/payment/:vendorId/booking', authMiddleware, authorizeRoles('user'), checkUserBlock, (req: CustomRequest, res) => this._walletController.BookingConfirmTransaction(req, res))
        // .post subsciption payement

        this.router
            .get('/transactions', authMiddleware, authorizeRoles('user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._walletController.getTransactions(req, res));
    }
}