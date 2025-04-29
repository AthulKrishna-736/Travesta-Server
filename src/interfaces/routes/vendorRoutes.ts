import { container } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, createUserSchema } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { VendorController } from "../controllers/vendor/vendorController";
import { authorizeRoles } from "../../middlewares/roleMIddleware";


export class vendorRoutes extends BaseRouter {
    private vendorController: VendorController

    constructor() {
        super();
        this.vendorController = container.resolve(VendorController)
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res) => this.vendorController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this.vendorController.login(req, res))
            .post('/auth/google-login', (req: CustomRequest, res) => this.vendorController.loginGoogle(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res) => this.vendorController.verifyOTP(req, res))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res) => this.vendorController.resendOtp(req, res))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res) => this.vendorController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res) => this.vendorController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin', 'vendor'), (req: CustomRequest, res) => this.vendorController.logout(req, res));


        this.router
            .get('/', authMiddleware, (req, res) => {
                res.send('Vendor authorized and authenticated successfully!');
            });
        // .put()  -> future: vendor profile update
        // .patch() -> future: vendor update password
        // .delete() -> future: vendor delete account
    }
}
