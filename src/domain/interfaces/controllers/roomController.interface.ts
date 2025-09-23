import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface IRoomController {
    createRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getRoomById(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getRoomsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAvailableRoomsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAllRooms(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getAllAvlRooms(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}