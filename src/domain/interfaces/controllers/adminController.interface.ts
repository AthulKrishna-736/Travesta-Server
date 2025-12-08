import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface IAdminController {
    blockOrUnblockUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAllUsers(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getVendorRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateVendorReq(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAdminAnalytics(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}