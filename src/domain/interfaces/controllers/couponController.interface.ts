import { Response, NextFunction } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface ICouponController {
    createCoupon(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    updateCoupon(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getVendorCoupons(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getUserCoupons(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    toggleCouponStatus(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
