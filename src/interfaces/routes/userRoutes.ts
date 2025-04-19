import { container } from "tsyringe";
import { UserController } from "../controllers/userController";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserSchema, loginSchema } from "../dtos/user/user.dto";
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
            .post('/auth/verifyOtp', (req, res) => this.userController.verifyOtpAndRegister(req, res))
            //     .post('/auth/kyc')
            .patch('/auth/forgot-password', (req, res) => this.userController.forgotPassword(req, res))
            .patch('/auth/reset-password', (req, res) => this.userController.updatePassword(req, res));

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