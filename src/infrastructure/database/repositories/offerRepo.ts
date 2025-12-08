import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepo";
import { IOffer } from "../../../domain/interfaces/model/offer.interface";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import mongoose, { QueryOptions } from "mongoose";
import { offerModel, TOfferDocument } from "../models/offerModel";

@injectable()
export class OfferRepository extends BaseRepository<TOfferDocument> implements IOfferRepository {
    constructor() {
        super(offerModel);
    }

    async createOffer(data: Partial<IOffer>): Promise<IOffer | null> {
        const doc = await this.create(data);
        return doc?.toObject() || null;
    }

    async updateOffer(offerId: string, data: Partial<IOffer>): Promise<IOffer | null> {
        const updated = await this.update(offerId, data);
        return updated?.toObject() || null;
    }

    async findOfferById(offerId: string): Promise<IOffer | null> {
        const offer = await this.model.findById(offerId).lean<IOffer>();
        return offer || null;
    }

    async getVendorOffers(vendorId: string, page: number, limit: number, search?: string): Promise<{ offers: IOffer[], total: number }> {
        const skip = (page - 1) * limit;
        const filter: QueryOptions = { vendorId: new mongoose.Types.ObjectId(vendorId) };

        if (search) {
            const r = new RegExp(search, "i");
            filter.name = { $regex: r };
        }

        const total = await this.model.countDocuments(filter);
        const offers = await this.model.find(filter).skip(skip).limit(limit).exec();
        return { offers, total };
    }

    async findApplicableOffers(roomType: string, date: Date = new Date(), hotelId: string | null = null): Promise<IOffer[]> {
        const query: any = {
            roomType,
            isBlocked: false,
            startDate: { $lte: date },
            expiryDate: { $gte: date },
            $or: []
        };

        query.$or.push({ hotelId: null });

        if (hotelId) {
            query.$or.push({ hotelId: new mongoose.Types.ObjectId(hotelId) });
        }

        const offers = await this.model.find(query).lean<IOffer[]>() || [];
        return offers;
    }


    async toggleOfferStatus(offerId: string): Promise<IOffer | null> {
        const offer = await this.model.findById(offerId);
        if (!offer) return null;
        offer.isBlocked = !offer.isBlocked;
        const saved = await offer.save();
        return saved.toObject();
    }

    async checkOfferOverlap(vendorId: string, roomType: string, startDate: Date, expiryDate: Date, hotelId?: string | null, excludeOfferId?: string): Promise<boolean> {
        const query: QueryOptions = {
            vendorId: new mongoose.Types.ObjectId(vendorId),
            roomType,
            startDate: { $lte: expiryDate },
            expiryDate: { $gte: startDate }
        };

        if (excludeOfferId) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeOfferId) };
        }

        if (!hotelId) {
            query.hotelId = null;
        } else {
            query.$or = [
                { hotelId: null },
                { hotelId: new mongoose.Types.ObjectId(hotelId) }
            ];
        }

        const conflictingOffers = await this.model.findOne(query).lean();
        return !!conflictingOffers;
    }

}
