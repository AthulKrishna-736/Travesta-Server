import { container } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, createUserSchema, googleLoginSchema } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { AuthController } from "../controllers/base/authController";
import { checkUserBlock } from "../../middlewares/checkBlock";


export class vendorRoutes extends BaseRouter {
    private authController: AuthController

    constructor() {
        super();
        this.authController = container.resolve(AuthController)
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res) => this.authController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this.authController.login(req, res))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res) => this.authController.loginGoogle(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res) => this.authController.verifyOTP(req, res))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res) => this.authController.resendOtp(req, res))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res) => this.authController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res) => this.authController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this.authController.logout(req, res));


        this.router
            .get('/', authMiddleware, (req, res) => {
                res.send('Vendor authorized and authenticated successfully!');
            });
        // .put()  -> future: vendor profile update
        // .patch() -> future: vendor update password
        // .delete() -> future: vendor delete account
    }
}
