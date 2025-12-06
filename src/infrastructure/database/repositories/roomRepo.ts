import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { roomModel, TRoomDocument } from "../models/roomModel";
import { IRoom, TCreateRoomData, TUpdateRoomData } from "../../../domain/interfaces/model/room.interface";
import { IRoomRepository } from "../../../domain/interfaces/repositories/roomRepo.interface";
import { hotelModel } from "../models/hotelModel";
import { bookingModel } from "../models/bookingModel";
import mongoose, { Types, PipelineStage, QueryOptions } from "mongoose";

@injectable()
export class RoomRepository extends BaseRepository<TRoomDocument> implements IRoomRepository {
    constructor() {
        super(roomModel);
    }

    async createRoom(data: TCreateRoomData): Promise<IRoom | null> {
        const room = await this.create(data);
        return room.toObject();
    }

    async findRoomById(roomId: string): Promise<IRoom | null> {
        const room = await this.model.findById(roomId)
            .populate({ path: "hotelId", select: "name images rating city state address amenities tags", })
            .populate('amenities', '_id name')
            .lean();

        return room || null;
    }

    async updateRoom(roomId: string, data: TUpdateRoomData): Promise<IRoom | null> {
        const room = await this.update(roomId, data);
        return room?.toObject() || null;
    }

    async deleteRoom(roomId: string): Promise<any> {
        const result = await this.delete(roomId);
        return result
    }

    async findDuplicateRooms(roomName: string, hotelId: string): Promise<boolean> {
        const rooms = await this.model.countDocuments({
            hotelId: hotelId,
            name: { $regex: `^${roomName}$`, $options: 'i' }
        });

        return rooms > 0;
    }

    async findRoomsByHotel(hotelId: string): Promise<IRoom[] | null> {
        const rooms = await this.find({ hotelId })
            .populate({ path: "amenities", select: "_id name" })
            .lean<IRoom[]>();

        return rooms;
    }

    async findOtherRoomsByHotel(hotelId: string, excludeRoomId: string): Promise<IRoom[]> {
        const rooms = await this.model
            .find({
                hotelId,
                _id: { $ne: excludeRoomId }
            })
            .populate('amenities', '_id name')
            .lean();

        return rooms || [];
    }

    async findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null> {
        const rooms = await this.find({ hotelId, isAvailable: true }).lean<IRoom[]>();
        return rooms;
    }

    async findAllRooms(vendorId: string, page: number, limit: number, search?: string, hotelId?: string): Promise<{ rooms: IRoom[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter: QueryOptions = {};

        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [{ name: regex }];
        }

        if (hotelId) {
            filter.hotelId = new Types.ObjectId(hotelId);
        }

        const pipeline: PipelineStage[] = [
            {
                $match: { ...filter }
            },
            {
                $lookup: {
                    from: 'amenities',
                    foreignField: '_id',
                    localField: 'amenities',
                    pipeline: [{ $project: { name: 1, type: 1 } }],
                    as: 'amenities'
                }
            },
            {
                $lookup: {
                    from: 'hotels',
                    let: {
                        hotelId: '$hotelId',
                        vendorId: new Types.ObjectId(vendorId),
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$vendorId', '$$vendorId'] },
                                        { $eq: ['$_id', '$$hotelId'] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                vendorId: 1,
                            }
                        }
                    ],
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },

            {
                $facet: {
                    totalCount: [
                        { $count: 'totalRooms' }
                    ],
                    rooms: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ]
                }
            }
        ]

        const result = await this.model.aggregate(pipeline);

        const rooms = result[0].rooms;
        const total = result[0].totalCount[0]?.totalRooms;

        return { rooms, total };
    }

    async getRoomPerformance(hotelId: string, period: 'week' | 'month' | 'year'): Promise<any> {
        const now = new Date();
        const start = new Date();
        if (period === "week") start.setDate(now.getDate() - 7);
        if (period === "month") start.setMonth(now.getMonth() - 1);
        if (period === "year") start.setFullYear(now.getFullYear() - 1);


        return bookingModel.aggregate([
            {
                $match: {
                    hotelId: new mongoose.Types.ObjectId(hotelId),
                    createdAt: { $gte: start, $lte: now },
                    status: "confirmed"
                }
            },
            {
                $group: {
                    _id: "$roomId",
                    bookings: { $sum: 1 },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "_id",
                    as: "room"
                }
            },
            { $unwind: "$room" },
            {
                $project: {
                    name: "$room.name",
                    type: "$room.roomType",
                    bookings: 1,
                    revenue: 1
                }
            },
            { $sort: { revenue: -1 } }
        ]);
    }
}
