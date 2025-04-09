import { Router } from "express";

export abstract class BaseRouter {
    protected router: Router;

    constructor(){
        this.router = Router();
        this.initializeRoutes();
    }

    protected abstract initializeRoutes(): void;

    public getRouter(): Router {
        return this.router;
    }
}