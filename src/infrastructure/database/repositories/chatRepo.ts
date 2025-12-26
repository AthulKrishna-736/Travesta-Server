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
            {
                $match: {
                    $or: [
                        { fromId: vendorId, fromRole: 'vendor' },
                        { toId: vendorId, toRole: 'vendor' }
                    ]
                }
            },

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

            {
                $match: {
                    otherUserRole: { $in: ['user', 'admin'] }
                }
            },

            {
                $sort: { createdAt: -1 }
            },

            {
                $group: {
                    _id: '$otherUserId',
                    role: { $first: '$otherUserRole' },
                    lastMessage: { $first: '$message' },
                    lastMessageTime: { $first: '$createdAt' }
                }
            },

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

            ...(searchRegex ? [{
                $match: {
                    'user.firstName': searchRegex
                }
            }] : []),

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

            {
                $sort: { lastMessageTime: -1 }
            }
        ]);
    }


    async getVendorsWhoChattedWithAdmin(adminId: string, search?: string): Promise<{ id: string; firstName: string; role: string; }[]> {
        const searchMatch = search ? { firstName: new RegExp('^' + search, 'i') } : {};

        const vendors = await this.model.aggregate([
            {
                $match: {
                    $or: [{ fromId: adminId }, { toId: adminId }]
                }
            },

            {
                $project: {
                    vendorId: {
                        $cond: [
                            { $eq: ['$fromId', adminId] },
                            '$toId',
                            '$fromId'
                        ]
                    }
                }
            },

            {
                $group: {
                    _id: '$vendorId'
                }
            },

            {
                $addFields: {
                    vendorObjectId: { $toObjectId: '$_id' }
                }
            },

            {
                $lookup: {
                    from: 'users',
                    let: { vendorId: '$vendorObjectId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$vendorId'] },
                                        { $eq: ['$role', 'vendor'] },
                                        { $eq: ['$isVerified', true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                role: 1
                            }
                        }
                    ],
                    as: 'userDetails'
                }
            },

            { $unwind: '$userDetails' },

            {
                $match: {
                    ...(search ? { 'userDetails.firstName': searchMatch.firstName } : {})
                }
            },

            {
                $project: {
                    id: '$userDetails._id',
                    firstName: '$userDetails.firstName',
                    role: '$userDetails.role'
                }
            }
        ]);

        return vendors;
    }

    async getVendorsWhoChattedWithUser(userId: string, search?: string): Promise<{ id: string; firstName: string; role: string; lastMessage?: string; lastMessageTime?: Date; }[]> {
        const today = new Date();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

        const searchRegex = search ? new RegExp(search, 'i') : null;

        const vendors = await this.model.aggregate([
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

            {
                $lookup: {
                    from: 'hotels',
                    localField: 'validBookings.hotelId',
                    foreignField: '_id',
                    as: 'hotel',
                },
            },
            { $unwind: '$hotel' },

            {
                $lookup: {
                    from: 'users',
                    localField: 'hotel.vendorId',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            { $unwind: '$vendor' },

            {
                $match: {
                    'vendor.role': 'vendor',
                    ...(searchRegex
                        ? { 'vendor.firstName': searchRegex }
                        : {}),
                },
            },

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

            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
                },
            },

            {
                $group: {
                    _id: '$vendor._id',
                    firstName: { $first: '$vendor.firstName' },
                    role: { $first: '$vendor.role' },
                    lastMessage: { $first: '$lastMessage.message' },
                    lastMessageTime: { $first: '$lastMessage.createdAt' },
                },
            },

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

            {
                $sort: {
                    lastMessageTime: -1,
                },
            },
        ]);

        return vendors;
    }
}
