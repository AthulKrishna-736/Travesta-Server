import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { ratingModel, TRatingDocument, } from "../models/ratingModel";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { TCreateRating, IRating, TUpdateRating } from "../../../domain/interfaces/model/rating.interface";
import mongoose from "mongoose";


@injectable()
export class RatingRepository extends BaseRepository<TRatingDocument> implements IRatingRepository {
    constructor() {
        super(ratingModel);
    }

    async createRating(create: TCreateRating): Promise<IRating> {
        const rating = await this.create(create);
        return rating;
    }

    async updateRating(ratingId: string, update: TUpdateRating): Promise<IRating | null> {
        const rating = await this.update(ratingId, update);
        return rating;
    }

    async getRatingById(ratingId: string): Promise<IRating | null> {
        const rating = await this.findById(ratingId);
        return rating;
    }

    async getUserRatings(userId: string): Promise<IRating[] | null> {
        const ratings = await this.model.find({ userId: userId }).exec();
        return ratings;
    }

    async getAllRatings(): Promise<IRating[] | null> {
        const ratings = await this.model.find().exec();
        return ratings;
    }

    async getHotelRatings(hotelId: string, page: number, limit: number): Promise<{ ratings: IRating[] | null, total: number }> {
        const skip = (page - 1) * limit;

        const total = await this.model.countDocuments({ hotelId });
        const ratings = await this.model
            .find({ hotelId })
            .populate({
                path: "userId",
                select: "firstName lastName profileImage _id"
            })
            .skip(skip)
            .limit(limit)
            .exec();

        return { ratings, total };
    }

    async getHotelRateImages(hotelId: string): Promise<IRating[] | null> {
        const ratings = await this.model.find({ hotelId }).sort({ createdAt: -1 }).exec()
        return ratings;
    }

    async findUserDuplicateHotelRatings(userId: string, hotelId: string): Promise<IRating | null> {
        const rating = await this.model.findOne({ userId, hotelId }).exec();
        return rating;
    }

    async getHotelRatingSummary(hotelId: string): Promise<{
        totalRatings: number;
        averageRating: number;
        averages: {
            hospitality: number;
            cleanliness: number;
            facilities: number;
            room: number;
            moneyValue: number;
        };
    }> {
        const result = await this.model.aggregate([
            { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
            {
                $group: {
                    _id: "$hotelId",
                    totalRatings: { $sum: 1 },
                    hospitality: { $avg: "$hospitality" },
                    cleanliness: { $avg: "$cleanliness" },
                    facilities: { $avg: "$facilities" },
                    room: { $avg: "$room" },
                    moneyValue: { $avg: "$moneyValue" },
                    averageRating: {
                        $avg: {
                            $avg: ["$hospitality", "$cleanliness", "$facilities", "$room", "$moneyValue"]
                        }
                    }
                }
            }
        ]);

        // If no data found → return default values
        if (!result || result.length === 0) {
            return {
                totalRatings: 0,
                averageRating: 0,
                averages: {
                    hospitality: 0,
                    cleanliness: 0,
                    facilities: 0,
                    room: 0,
                    moneyValue: 0
                }
            };
        }

        const data = result[0];

        return {
            totalRatings: data.totalRatings,
            averageRating: Number(data.averageRating.toFixed(1)),
            averages: {
                hospitality: Number(data.hospitality.toFixed(1)),
                cleanliness: Number(data.cleanliness.toFixed(1)),
                facilities: Number(data.facilities.toFixed(1)),
                room: Number(data.room.toFixed(1)),
                moneyValue: Number(data.moneyValue.toFixed(1))
            }
        };
    }

    private buildDateFilter(startDate?: string, endDate?: string) {
        if (!startDate || !endDate) return {};

        return {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
    }

    async getAverageRating(startDate?: string, endDate?: string): Promise<any> {
        const filter = this.buildDateFilter(startDate, endDate);

        const result = await ratingModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    avgHospitality: { $avg: "$hospitality" },
                    avgCleanliness: { $avg: "$cleanliness" },
                    avgFacilities: { $avg: "$facilities" },
                    avgRoom: { $avg: "$room" },
                    avgValue: { $avg: "$moneyValue" },
                }
            }
        ]);

        return result[0] ?? null;
    }

} 