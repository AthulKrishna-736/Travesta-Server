import { container } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, createUserSchema, googleLoginSchema, updateUserSchema } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { AuthController } from "../controllers/base/authController";
import { checkUserBlock } from "../../middlewares/checkBlock";
import { upload } from "../../infrastructure/config/multer";
import { VendorController } from "../controllers/vendor/vendorController";


export class vendorRoutes extends BaseRouter {
    private _authController: AuthController
    private _vendorController: VendorController

    constructor() {
        super();
        this._authController = container.resolve(AuthController)
        this._vendorController = container.resolve(VendorController)
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res) => this._authController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this._authController.login(req, res))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res) => this._authController.loginGoogle(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res) => this._authController.verifyOTP(req, res))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res) => this._authController.resendOtp(req, res))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res) => this._authController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res) => this._authController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._authController.logout(req, res))


            .patch('/profile', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res) => this._vendorController.updateProfile(req, res))
    }
}
