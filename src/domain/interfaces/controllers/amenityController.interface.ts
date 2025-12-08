import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface IAmenityController {
    createAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    blockUnblockAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    blockUnblockAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAllAmenities(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAllActiveAmenities(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getUsedActiveAmenities(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}