import { BaseRouter } from "./baseRouter";


export class userRoutes extends BaseRouter {
    //controller property

    constructor() {
        super();
        //user controller instance create
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/signup')
            .post('/auth/login')
            .post('/auth/kyc')
            .patch('/auth/forgot-password')
            .patch('/auth/reset-password');

        this.router 
            .route('/')
            .get()
            .patch()
            .put()
            .delete()
    }
}