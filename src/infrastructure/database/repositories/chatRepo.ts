import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { IChatMessage, TCreateChatMessage } from "../../../domain/interfaces/model/chat.interface";
import { chatMessageModel, TChatMessageDocument } from "../models/chatModel";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";

@injectable()
export class ChatRepository extends BaseRepository<TChatMessageDocument> implements IChatRepository {
    constructor() {
        super(chatMessageModel);
    }

    async findMsgById(messageId: string): Promise<IChatMessage> {
        const message = await this.findById(messageId);
        return message?.toObject();
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

    async markConversationAsRead(senderId: string, receiverId: string): Promise<void> {
        await chatMessageModel.updateMany(
            { fromId: senderId, toId: receiverId, isRead: false },
            { $set: { isRead: true } }
        );
    }

    async getUnreadMessages(userId: string): Promise<{ id: string; count: number }[]> {
        const result = await this.model.aggregate([
            { $match: { toId: userId.toString(), isRead: false } },
            { $group: { '_id': '$fromId', count: { $sum: 1 } } },
            { $project: { id: '$_id', count: 1, _id: 0 } }
        ])
        return result;
    }

    async getUsersWhoChattedWithVendor(vendorId: string, search?: string): Promise<{ id: string, firstName: string, role: string }[]> {
        const matchUserFilter: any = {
            "userDetails.role": "user",
        };

        const searchRegex = search ? new RegExp('^' + search, 'i') : '';
        if (search) {
            matchUserFilter["userDetails.firstName"] = searchRegex;
        }

        const users = await this.model.aggregate([
            {
                $match: {
                    $or: [{ fromId: vendorId }, { toId: vendorId }],
                },
            },
            {
                $project: {
                    userId: {
                        $cond: [{ $eq: ["$fromId", vendorId] }, "$toId", "$fromId"],
                    },
                },
            },
            {
                $group: {
                    _id: "$userId",
                },
            },
            {
                $addFields: {
                    objectUserId: { $toObjectId: "$_id" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "objectUserId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails",
            },
            {
                $match: matchUserFilter,
            },
            {
                $project: {
                    id: "$userDetails._id",
                    firstName: "$userDetails.firstName",
                    role: "$userDetails.role",
                },
            },
            {
                $unionWith: {
                    coll: "users",
                    pipeline: [
                        {
                            $match: {
                                role: "admin",
                                ...(searchRegex
                                    ? { firstName: searchRegex }
                                    : {}),
                            },
                        },
                        {
                            $project: {
                                id: "$_id",
                                firstName: "$firstName",
                                role: "$role",
                            },
                        },
                    ],
                },
            },
        ]);

        return users;
    }

    async getVendorsWhoChattedWithAdmin(adminId: string, search?: string): Promise<{ id: string; firstName: string; role: string; }[]> {

        const matchUserFilter: any = {};
        if (search) {
            const searchRegex = search ? new RegExp('^' + search, 'i') : '';
            matchUserFilter["userDetails.firstName"] = searchRegex;
        }

        const vendors = await this.model.aggregate([
            {
                $match: {
                    $or: [{ fromId: adminId }, { toId: adminId }]
                }
            },
            {
                $project: {
                    adminId: {
                        $cond: [
                            { $eq: ["$fromId", adminId] },
                            "$toId",
                            "$fromId"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$adminId"
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
                $match: matchUserFilter
            },
            {
                $project: {
                    id: "$userDetails._id",
                    firstName: "$userDetails.firstName",
                    role: "$userDetails.role",
                }
            }
        ])

        return vendors;
    }

    async getVendorsWhoChattedWithUser(userId: string, search?: string) {
        return this.getVendorsWhoChattedWithAdmin(userId, search);
    }
}
