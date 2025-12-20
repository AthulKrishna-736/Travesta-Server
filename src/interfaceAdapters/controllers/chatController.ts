import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { NextFunction, Response } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { IGetChatAccessUseCase, IGetChatMessagesUseCase, IGetChattedUsersUseCase, IGetUserUnreadMsgUseCase, IGetVendorsChatWithAdminUseCase, IGetVendorsChatWithUserUseCase, IMarkMsgAsReadUseCase, ISendMessageUseCase } from "../../domain/interfaces/model/chat.interface";
import { AppError } from "../../utils/appError";
import { AUTH_ERROR_MESSAGES, CHAT_ERROR_MESSAGES } from "../../constants/errorMessages";
import { IChatController } from "../../domain/interfaces/controllers/chatController.interface";

@injectable()
export class ChatController implements IChatController {
    constructor(
        @inject(TOKENS.GetChatMessagesUseCase) private _getChatMessagesUseCase: IGetChatMessagesUseCase,
        @inject(TOKENS.SendMessageUseCase) private _sendMessageUseCase: ISendMessageUseCase,
        @inject(TOKENS.GetChattedUsersUseCase) private _getChattedUsersUseCase: IGetChattedUsersUseCase,
        @inject(TOKENS.GetVendorsChatWithUserUseCase) private _getVendorsChatUserUseCase: IGetVendorsChatWithUserUseCase,
        @inject(TOKENS.GetVendorsChatWithAdminUseCase) private _getVendorsChatAdminUseCase: IGetVendorsChatWithAdminUseCase,
        @inject(TOKENS.GetUserUnreadMsgUseCase) private _getUserUnreadMsgUseCase: IGetUserUnreadMsgUseCase,
        @inject(TOKENS.GetChatAccessUseCase) private _getChatAccessUseCase: IGetChatAccessUseCase,
        @inject(TOKENS.MarkMsgAsReadUseCase) private _markMessageRead: IMarkMsgAsReadUseCase,
    ) { }

    async getChatMessages(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId = req.user?.userId;
            const targetUserId = req.params.userId;

            if (!currentUserId || !targetUserId) {
                throw new AppError(CHAT_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { chat, message } = await this._getChatMessagesUseCase.getChatMessage(currentUserId, targetUserId);

            ResponseHandler.success(res, message, chat, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
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

        await this._sendMessageUseCase.sendMessage(payload);
        ResponseHandler.success(res, 'Message sent', null, HttpStatusCode.OK);
    }

    async getChattedUsers(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            const search = req.query.search as string;

            if (!vendorId) {
                throw new AppError('Unauthorized vendor', HttpStatusCode.UNAUTHORIZED);
            }

            const { users, message } = await this._getChattedUsersUseCase.getChattedUsers(vendorId as string, search);
            ResponseHandler.success(res, message, users, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getVendorsChatWithUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = req.query.search as string;
            const userId = req.user?.userId;

            const { vendors, message } = await this._getVendorsChatUserUseCase.getVendorsChatWithUser(userId as string, search);
            ResponseHandler.success(res, message, vendors, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getVendorsChatWithAdmin(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = req.query.search as string;
            const userId = req.user?.userId;

            const { vendors, message } = await this._getVendorsChatAdminUseCase.getVendorsChatWithAdmin(userId as string, search);
            ResponseHandler.success(res, message, vendors, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getUnreadMsg(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message, users } = await this._getUserUnreadMsgUseCase.getUnreadMsg(userId);
            ResponseHandler.success(res, message, users, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async readMessage(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user?.userId;
            const { receiverId } = req.params;
            if (!user || !receiverId) {
                throw new AppError('Sender or receiver id missing', HttpStatusCode.BAD_REQUEST);
            }

            await this._markMessageRead.markMsgAsRead(user, receiverId)
            ResponseHandler.success(res, 'Successfully Read message', HttpStatusCode.OK);
        } catch (error) {

        }
    }

    async getchatAccess(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message } = await this._getChatAccessUseCase.getChatAccess(userId);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
