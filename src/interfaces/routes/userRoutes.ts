import { container } from "tsyringe";
import { UserController } from "../controllers/userController";
import { BaseRouter } from "./baseRouter";


export class userRoutes extends BaseRouter {
    private userController: UserController

    constructor() {
        super();
        this.userController = container.resolve(UserController)
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/signup', (req, res) => this.userController.register(req, res))
            .post('/auth/login', (req, res) => this.userController.login(req, res))
            .post('/auth/kyc')
            .patch('/auth/forgot-password')
            .patch('/auth/reset-password');

        this.router 
            .route('/')
            .get() //get profile
            .patch() //password update
            .put( (req, res) => this.userController.updateProfile(req, res)) //profile update
            .delete() //profile delete
    }
}