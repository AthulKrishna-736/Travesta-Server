import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { ICoupon } from "../../../domain/interfaces/model/coupon.interface";
import { couponModel, TCouponDocument } from "../models/couponModel";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { QueryOptions } from "mongoose";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class CouponRepository extends BaseRepository<TCouponDocument> implements ICouponRepository {
    constructor() {
        super(couponModel);
    }

    async createCoupon(data: Partial<Omit<ICoupon, '_id'>>): Promise<ICoupon | null> {
        const coupon = await this.create(data);
        return coupon.toObject();
    }

    async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
        const updated = await this.update(id, data);
        return updated?.toObject() || null;
    }

    async findByCode(code: string): Promise<ICoupon | null> {
        const coupon = await this.model.findOne({ code }).lean<ICoupon>();
        return coupon || null;
    }

    async findCouponById(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.model.findById(couponId);
        return coupon;
    }

    async getVendorCoupons(vendorId: string, page: number, limit: number, search?: string): Promise<{ coupons: ICoupon[], total: number }> {
        const skip = (page - 1) * limit;
        const filterQuery: QueryOptions = { vendorId: vendorId }

        if (search) {
            const regex = new RegExp(search, "i");
            filterQuery.name = { $regex: regex };
        }

        const total = await this.model.countDocuments(filterQuery);
        const coupons = await this.model
            .find(filterQuery)
            .skip(skip)
            .limit(limit)
            .exec();
        return { coupons, total }
    }

    async getUserAvailableCoupons(vendorId: string, date: Date, price: number): Promise<ICoupon[]> {
        const coupons = await this.model.find({
            vendorId,
            isBlocked: false,
            startDate: { $lte: date },
            endDate: { $gte: date },
            minPrice: { $lte: price },
            maxPrice: { $gte: price }
        }).lean<ICoupon[]>() || [];
        return coupons;
    }

    async toggleCouponStatus(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.model.findById(couponId);
        if (!coupon) return null;

        coupon.isBlocked = !coupon.isBlocked;

        return await coupon.save();

    }

    async validateCoupon(couponId: string, vendorId: string, total: number): Promise<ICoupon> {
        const coupon = await this.model.findOne({
            _id: couponId,
            vendorId,
            isBlocked: false,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
            minPrice: { $lte: total },
            maxPrice: { $gte: total },
            count: { $gt: 0 },
        }).lean();

        if (!coupon) {
            throw new AppError('Invalid or expired coupon', HttpStatusCode.BAD_REQUEST);
        }

        return coupon;
    }
}
