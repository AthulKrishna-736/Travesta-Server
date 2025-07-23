import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { Response } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { IGetChatMessagesUseCase, IGetChattedUsersUseCase, IGetVendorsChatWithAdminUseCase, IGetVendorsChatWithUserUseCase, ISendMessageUseCase } from "../../domain/interfaces/model/chat.interface";
import { AppError } from "../../utils/appError";

@injectable()
export class ChatController {
    constructor(
        @inject(TOKENS.GetChatMessagesUseCase) private _getChatMessages: IGetChatMessagesUseCase,
        @inject(TOKENS.SendMessageUseCase) private _sendMessage: ISendMessageUseCase,
        @inject(TOKENS.GetChattedUsersUseCase) private _getChattedUsers: IGetChattedUsersUseCase,
        @inject(TOKENS.GetVendorsChatWithUserUseCase) private _getVendorsChatUser: IGetVendorsChatWithUserUseCase,
        @inject(TOKENS.GetVendorsChatWithAdminUseCase) private _getVendorsChatAdmin: IGetVendorsChatWithAdminUseCase,
    ) { }

    async getChatMessages(req: CustomRequest, res: Response): Promise<void> {
        try {
            const currentUserId = req.user?.userId;
            const targetUserId = req.params.userId;

            if (!currentUserId || !targetUserId) {
                throw new AppError('Curr or target user id missing', HttpStatusCode.BAD_REQUEST);
            }

            const { chat, message } = await this._getChatMessages.getChatMessage(currentUserId, targetUserId);

            ResponseHandler.success(res, message, chat, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(req: CustomRequest, res: Response): Promise<void> {
        const { toId, toRole, message } = req.body;
        const fromId = req.user?.userId;
        const fromRole = req.user?.role;

        if (!fromId || !fromRole) {
            throw new AppError('no fromid and from role or user', HttpStatusCode.BAD_REQUEST);
        }

        const payload = {
            fromId,
            fromRole,
            toId,
            toRole,
            message,
        }

        await this._sendMessage.sendMessage(payload);

        ResponseHandler.success(res, 'Message sent', null, HttpStatusCode.OK);
    }

    async getChattedUsers(req: CustomRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            const search = req.query.search as string;

            if (!vendorId) {
                throw new AppError('Unauthorized vendor', HttpStatusCode.UNAUTHORIZED);
            }

            const { users, message } = await this._getChattedUsers.getChattedUsers(vendorId as string, search);
            ResponseHandler.success(res, message, users, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getVendorsChatWithUser(req: CustomRequest, res: Response): Promise<void> {
        try {
            const search = req.query.search as string;
            const userId = req.user?.userId;

            const { vendors, message } = await this._getVendorsChatUser.getVendorsChatWithUser(userId as string, search);
            ResponseHandler.success(res, message, vendors, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

    async getVendorsChatWithAdmin(req: CustomRequest, res: Response): Promise<void> {
        try {
            const search = req.query.search as string;
            const userId = req.user?.userId;

            const { vendors, message } = await this._getVendorsChatAdmin.getVendorsChatWithAdmin(userId as string, search);
            ResponseHandler.success(res, message, vendors, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }
}
