import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface IVendorController {
    updateProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateKyc(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getVendorProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}