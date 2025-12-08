import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface IAuthController {
    register(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    resendOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    login(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    loginGoogle(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    forgotPassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updatePassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    verifyOTP(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    logout(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}