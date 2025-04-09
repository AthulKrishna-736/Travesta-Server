import { BaseRouter } from "./baseRouter";


export class adminRoutes extends BaseRouter {
    //properties
    constructor(){
        super()
        //controllers injection
    }

    protected initializeRoutes(): void {
        this.router.post('/auth/login');
        this.router
        .route('/')
        .get()
        .patch()
        .put()
    }
}