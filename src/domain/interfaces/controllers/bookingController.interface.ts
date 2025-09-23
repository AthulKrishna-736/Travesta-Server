import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface IBookingController {
    createBooking(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getBookingsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getBookingsByUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    cancelBooking(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getBookingsToVendor(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}