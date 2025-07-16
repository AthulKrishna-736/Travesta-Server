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

export class userRoutes extends BaseRouter {
    private _authController: AuthController
    private _userController: UserController
    private _hotelController: HotelController
    private _chatController: ChatController

    constructor() {
        super();
        this._authController = container.resolve(AuthController)
        this._userController = container.resolve(UserController)
        this._hotelController = container.resolve(HotelController)
        this._chatController = container.resolve(ChatController)
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        this.router
            //auth routes
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res) => this._authController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this._authController.login(req, res))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res) => this._authController.loginGoogle(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res) => this._authController.verifyOTP(req, res))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res) => this._authController.resendOtp(req, res))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res) => this._authController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res) => this._authController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req: CustomRequest, res) => this._authController.logout(req, res))

            //profile routes
            .patch('/profile', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res) => this._userController.updateProfile(req, res))
            .get('/profile', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req: CustomRequest, res) => this._userController.getProfile(req, res))


            .get('/hotels', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req: CustomRequest, res) => this._hotelController.getAllHotels(req, res))
            .get('/hotels/:id', authMiddleware, authorizeRoles('user', 'vendor', 'admin'), checkUserBlock, (req, res) => this._hotelController.getHotelById(req, res));

        //chat
        this.router
            .get('/chat/:userId', authMiddleware, authorizeRoles("admin", "vendor", "user"), checkUserBlock, (req: CustomRequest, res) => this._chatController.getChatMessages(req, res))
            .get('/chat-vendors', authMiddleware, authorizeRoles('admin', 'user', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getVendorsChatWithUser(req, res))
    }
}