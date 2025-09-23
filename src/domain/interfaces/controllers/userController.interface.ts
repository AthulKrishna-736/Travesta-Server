import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../utils/customRequest";


export interface IUserController {
    updateProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}