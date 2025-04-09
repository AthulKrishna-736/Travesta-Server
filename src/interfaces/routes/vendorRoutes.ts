import { BaseRouter } from "./baseRouter";



export class vendorRoutes extends BaseRouter {
    //properties

    constructor(){
        super();
        //controllers instance creation
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
        .put()
        .patch()
        .delete()
    }
}