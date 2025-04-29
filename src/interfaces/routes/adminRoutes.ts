import { container } from "tsyringe";
import { AdminController } from "../controllers/admin/adminController";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema } from "../../shared/types/zodValidation";
import { CustomRequest } from "../../utils/customRequest";
import { authMiddleware } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleMIddleware";

export class adminRoutes extends BaseRouter {
    private adminController: AdminController;

    constructor() {
        super();
        this.adminController = container.resolve(AdminController);
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this.adminController.login(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this.adminController.logout(req, res));

    }
}