import { Response, NextFunction } from "express";
import { CustomRequest } from "../../../utils/customRequest";

export interface IOfferController {
    createOffer(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    updateOffer(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getVendorOffers(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    detectOfferForRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    toggleOfferStatus(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
