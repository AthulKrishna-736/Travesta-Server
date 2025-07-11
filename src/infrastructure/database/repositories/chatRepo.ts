import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { IChatMessage, TCreateChatMessage, TUpdateChatMessage } from "../../../domain/interfaces/model/chat.interface";
import { chatMessageModel, TChatMessageDocument } from "../models/chatModel";
import { IChatRepository } from "../../../domain/interfaces/repositories/repository.interface";

@injectable()
export class ChatRepository extends BaseRepository<TChatMessageDocument> implements IChatRepository {
    constructor() {
        super(chatMessageModel);
    }

    async createMessage(data: TCreateChatMessage): Promise<IChatMessage> {
        const message = await this.create({ ...data });
        return message.toObject();
    }

    async getMessagesBetweenUsers(fromId: string, toId: string): Promise<IChatMessage[]> {
        return this.find({
            $or: [
                { fromId, toId },
                { fromId: toId, toId: fromId }
            ]
        }).sort({ timestamp: 1 }).lean<IChatMessage[]>();
    }

    async markMessageAsRead(messageId: string): Promise<IChatMessage | null> {
        const message = await this.update(messageId, { isRead: true });
        return message?.toObject() || null;
    }

    async getUsersWhoChattedWithVendor(vendorId: string): Promise<{ id: string, firstName: string }[]> {
        const messages = await this.model.aggregate([
            {
                $match: {
                    $or: [{ fromId: vendorId }, { toId: vendorId }]
                }
            },
            {
                $project: {
                    userId: {
                        $cond: [
                            { $eq: ["$fromId", vendorId] },
                            "$toId",
                            "$fromId"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$userId"
                }
            },
            {
                $addFields: {
                    objectUserId: { $toObjectId: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "objectUserId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    id: "$userDetails._id",
                    firstName: "$userDetails.firstName"
                }
            }
        ]);

        return messages;
    }

}
