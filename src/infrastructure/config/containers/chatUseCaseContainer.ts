import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { GetChatMessagesUseCase } from "../../../application/use-cases/chat/getChatMsg.UseCase.";
import { SendMessageUseCase } from "../../../application/use-cases/chat/sendMsg.UseCase";
import { GetChattedUsersUseCase } from "../../../application/use-cases/chat/getChatUsers.UseCase";
import { MarkMsgAsReadUseCase } from "../../../application/use-cases/chat/markMsgRead.UseCase";
import { GetVendorsChatWithUserUseCase } from "../../../application/use-cases/chat/getVendorsChattedWithUser.UseCase";
import { GetVendorsChatWithAdmiinUseCase } from "../../../application/use-cases/chat/getVendorsChattedWithAdmin.UseCase";
import { GetUserUnreadMsgUseCase } from "../../../application/use-cases/chat/getUserUnreadMsg.UseCase";
import { GetChatAccessUseCase } from "../../../application/use-cases/chat/getChatAccess.UseCase";

import {
    IGetChatAccessUseCase,
    IGetChatMessagesUseCase,
    IGetChattedUsersUseCase,
    IGetUserUnreadMsgUseCase,
    IGetVendorsChatWithAdminUseCase,
    IGetVendorsChatWithUserUseCase,
    IMarkMsgAsReadUseCase,
    ISendMessageUseCase
} from "../../../domain/interfaces/model/chat.interface";


container.register<IGetChatMessagesUseCase>(TOKENS.GetChatMessagesUseCase, {
    useClass: GetChatMessagesUseCase,
})

container.register<ISendMessageUseCase>(TOKENS.SendMessageUseCase, {
    useClass: SendMessageUseCase,
})

container.register<IGetChattedUsersUseCase>(TOKENS.GetChattedUsersUseCase, {
    useClass: GetChattedUsersUseCase,
})

container.register<IMarkMsgAsReadUseCase>(TOKENS.MarkMsgAsReadUseCase, {
    useClass: MarkMsgAsReadUseCase,
})

container.register<IGetVendorsChatWithUserUseCase>(TOKENS.GetVendorsChatWithUserUseCase, {
    useClass: GetVendorsChatWithUserUseCase,
})

container.register<IGetVendorsChatWithAdminUseCase>(TOKENS.GetVendorsChatWithAdminUseCase, {
    useClass: GetVendorsChatWithAdmiinUseCase,
})

container.register<IGetUserUnreadMsgUseCase>(TOKENS.GetUserUnreadMsgUseCase, {
    useClass: GetUserUnreadMsgUseCase,
})

container.register<IGetChatAccessUseCase>(TOKENS.GetChatAccessUseCase, {
    useClass: GetChatAccessUseCase,
})