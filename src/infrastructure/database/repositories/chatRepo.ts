import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { IChatMessage, TCreateChatMessage } from "../../../domain/interfaces/model/chat.interface";
import { chatMessageModel, TChatMessageDocument } from "../models/chatModel";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { QueryOptions } from "mongoose";

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

    async getUsersWhoChattedWithVendor(
        vendorId: string,
        search?: string
    ): Promise<{
        id: string;
        firstName: string;
        role: string;
        lastMessage?: string;
        lastMessageTime?: Date;
    }[]> {

        const searchRegex = search ? new RegExp(search, 'i') : null;

        return this.model.aggregate([

            /**
             * 1. Only messages where vendor is involved
             */
            {
                $match: {
                    $or: [
                        { fromId: vendorId, fromRole: 'vendor' },
                        { toId: vendorId, toRole: 'vendor' }
                    ]
                }
            },

            /**
             * 2. Identify the OTHER participant
             */
            {
                $addFields: {
                    otherUserId: {
                        $cond: [
                            { $eq: ['$fromId', vendorId] },
                            '$toId',
                            '$fromId'
                        ]
                    },
                    otherUserRole: {
                        $cond: [
                            { $eq: ['$fromId', vendorId] },
                            '$toRole',
                            '$fromRole'
                        ]
                    }
                }
            },

            /**
             * 3. Keep only user / admin
             */
            {
                $match: {
                    otherUserRole: { $in: ['user', 'admin'] }
                }
            },

            /**
             * 4. Latest messages first
             */
            {
                $sort: { createdAt: -1 }
            },

            /**
             * 5. One entry per user (latest message)
             */
            {
                $group: {
                    _id: '$otherUserId',
                    role: { $first: '$otherUserRole' },
                    lastMessage: { $first: '$message' },
                    lastMessageTime: { $first: '$createdAt' }
                }
            },

            /**
             * 6. Join user collection
             */
            {
                $lookup: {
                    from: 'users',
                    let: { userId: { $toObjectId: '$_id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userId'] }
                            }
                        },
                        {
                            $project: {
                                firstName: 1,
                                role: 1
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            { $unwind: '$user' },

            /**
             * 7. Optional name search
             */
            ...(searchRegex ? [{
                $match: {
                    'user.firstName': searchRegex
                }
            }] : []),

            /**
             * 8. Final response shape
             */
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    firstName: '$user.firstName',
                    role: '$user.role',
                    lastMessage: 1,
                    lastMessageTime: 1
                }
            },

            /**
             * 9. Sort by most recent activity
             */
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);
    }


    async getVendorsWhoChattedWithAdmin(adminId: string, search?: string): Promise<{ id: string; firstName: string; role: string; }[]> {

        const matchUserFilter: QueryOptions = {};
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

    async getVendorsWhoChattedWithUser(userId: string, search?: string): Promise<{ id: string; firstName: string; role: string; lastMessage?: string; lastMessageTime?: Date; }[]> {
        const today = new Date();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

        const searchRegex = search ? new RegExp(search, 'i') : null;

        const vendors = await this.model.aggregate([
            /**
             * STEP 1: Find chat-eligible bookings for user
             */
            {
                $lookup: {
                    from: 'bookings',
                    let: { userId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', { $toObjectId: '$$userId' }] },
                                        { $eq: ['$status', 'confirmed'] },
                                        { $eq: ['$payment', 'success'] },
                                        {
                                            $lte: [
                                                { $subtract: ['$checkIn', twoDaysInMs] },
                                                today,
                                            ],
                                        },
                                        { $gte: ['$checkOut', today] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'validBookings',
                },
            },

            { $unwind: '$validBookings' },

            /**
             * STEP 2: Join hotel → vendorId
             */
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'validBookings.hotelId',
                    foreignField: '_id',
                    as: 'hotel',
                },
            },
            { $unwind: '$hotel' },

            /**
             * STEP 3: Join USERS collection (vendor details)
             */
            {
                $lookup: {
                    from: 'users',
                    localField: 'hotel.vendorId',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            { $unwind: '$vendor' },

            /**
             * STEP 4: Filter only vendor role
             */
            {
                $match: {
                    'vendor.role': 'vendor',
                    ...(searchRegex
                        ? { 'vendor.firstName': searchRegex }
                        : {}),
                },
            },

            /**
             * STEP 5: Get last chat message (if exists)
             */
            {
                $lookup: {
                    from: 'chatmessages',
                    let: {
                        vendorId: { $toString: '$vendor._id' },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ['$fromId', userId] },
                                                { $eq: ['$toId', '$$vendorId'] },
                                            ],
                                        },
                                        {
                                            $and: [
                                                { $eq: ['$fromId', '$$vendorId'] },
                                                { $eq: ['$toId', userId] },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'lastMessage',
                },
            },

            /**
             * STEP 6: Flatten last message
             */
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
                },
            },

            /**
             * STEP 7: Group by vendor (avoid duplicates)
             */
            {
                $group: {
                    _id: '$vendor._id',
                    firstName: { $first: '$vendor.firstName' },
                    role: { $first: '$vendor.role' },
                    lastMessage: { $first: '$lastMessage.message' },
                    lastMessageTime: { $first: '$lastMessage.createdAt' },
                },
            },

            /**
             * STEP 8: Final response shape
             */
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    firstName: 1,
                    role: 1,
                    lastMessage: 1,
                    lastMessageTime: 1,
                },
            },

            /**
             * STEP 9: Sort chats
             */
            {
                $sort: {
                    lastMessageTime: -1,
                },
            },
        ]);

        return vendors;
    }
}
