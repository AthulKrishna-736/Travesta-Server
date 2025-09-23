import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface IHotelController {
    createHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getHotelById(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAllHotelsToUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getHotelsByVendor(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getHotelByVendor(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}