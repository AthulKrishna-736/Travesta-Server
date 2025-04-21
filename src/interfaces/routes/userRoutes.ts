import { container } from "tsyringe";
import { UserController } from "../controllers/userController";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, createUserSchema, forgotPassSchema, updatePassSchema, verifyOtp } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";

export class userRoutes extends BaseRouter {
    private userController: UserController

    constructor() {
        super();
        this.userController = container.resolve(UserController)
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/signup', validateRequest(createUserSchema), (req, res) => this.userController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req, res) => this.userController.login(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req, res) => this.userController.verifyOTP(req, res))
            // .post('/auth/kyc')
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req, res) => this.userController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req, res) => this.userController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, (req, res) => this.userController.logout(req, res));


        this.router
            // .route('/',authMiddleware(req: Request, res: Response, next: NextFunction))
            .get('/', authMiddleware, (req, res) => {
                res.send('response sedning as authorized here properly here')
            }) //get profile
        //     .patch() //password update
        //     .put((req, res) => this.userController.updateProfile(req, res)) //profile update
        //     .delete() //profile delete
    }
}