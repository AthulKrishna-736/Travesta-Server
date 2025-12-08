import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface IChatController {
    getChatMessages(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    sendMessage(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getChattedUsers(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getVendorsChatWithUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getVendorsChatWithAdmin(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getUnreadMsg(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getchatAccess(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}