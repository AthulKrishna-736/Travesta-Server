import { container } from "tsyringe";
import { AdminController } from "../controllers/admin/adminController";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema } from "../../shared/types/zodValidation";
import { CustomRequest } from "../../utils/customRequest";
import { authMiddleware } from "../../middlewares/auth";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { AuthController } from "../controllers/base/authController";

export class adminRoutes extends BaseRouter {
    private authController: AuthController;
    private adminController: AdminController;

    constructor() {
        super();
        this.authController = container.resolve(AuthController);
        this.adminController = container.resolve(AdminController);
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this.router
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this.authController.login(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this.authController.logout(req, res))

            .get('/users', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this.adminController.getAllUsers(req, res))
            .patch('/users/:id/block-toggle', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this.adminController.blockOrUnblockUser(req, res))

            .get('/vendor-requests', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this.adminController.getVendorRequest(req, res))
            .patch('/vendor/:vendorId/verify', authMiddleware, authorizeRoles('admin'), (req: CustomRequest, res) => this.adminController.updateVendorReq(req, res))
    }
}