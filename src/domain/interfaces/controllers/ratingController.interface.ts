import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface IRatingController {
    createRating(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    updateRating(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getRatings(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getUserRatings(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getHotelRatings(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
