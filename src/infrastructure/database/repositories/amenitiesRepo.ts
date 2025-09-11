import { injectable } from "tsyringe";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { amenitiesModel, TAmenitiesDocument } from "../models/amenitiesModel";
import { BaseRepository } from "./baseRepo";
import { IAmenities, TCreateAmenityData, TUpdateAmenityData } from "../../../domain/interfaces/model/amenities.interface";
import { hotelModel } from "../models/hotelModel";
import { roomModel } from "../models/roomModel";

@injectable()
export class AmenitiesRepository extends BaseRepository<TAmenitiesDocument> implements IAmenitiesRepository {
    constructor() {
        super(amenitiesModel);
    }

    async createAmenity(data: TCreateAmenityData): Promise<IAmenities | null> {
        const amenity = await this.create(data);
        return amenity.toObject();
    }

    async updateAmenity(amenityId: string, data: TUpdateAmenityData): Promise<IAmenities | null> {
        const amenity = await this.update(amenityId, data);
        return amenity?.toObject() || null;
    }

    async findAmenityById(amenityId: string): Promise<IAmenities | null> {
        const amenity = await this.findById(amenityId);
        return amenity?.toObject() || null;
    }

    async findAllAmenities(page: number, limit: number, type: string = 'hotel', search?: string, sortField: string = 'name', sortOrder: string = 'ascending'): Promise<{ amenities: IAmenities[] | null, total: number }> {
        const skip = (page - 1) * limit;
        const order = sortOrder == 'descending' ? -1 : 1;
        const filter: any = { type }
        if (search) {
            const searchRegex = new RegExp(search, 'i')
            filter.$or = [
                { name: searchRegex },
            ]
        }

        const total = await this.model.countDocuments(filter);
        const amenities = await this.find(filter).skip(skip).limit(limit).sort({ [sortField]: order }).lean<IAmenities[]>();
        return { amenities, total }
    }

    async findUsedActiveAmenities(): Promise<IAmenities[] | null> {
        const hotelAmenityIds = await hotelModel.distinct("amenities", { amenities: { $exists: true, $ne: [] } });
        const roomAmenityIds = await roomModel.distinct("amenities", { amenities: { $exists: true, $ne: [] } });
        const allAmenityIds = [...new Set([...hotelAmenityIds, ...roomAmenityIds])];

        if (allAmenityIds.length === 0) {
            return [];
        }

        const amenities = await this.model.find({ _id: { $in: allAmenityIds }, isActive: true }).lean<IAmenities[]>();
        return amenities;
    }

    async getQuery(filter: any = {}): Promise<{ amenities: IAmenities[], total: number }> {
        const amenities = await this.find(filter);
        const total = await this.model.countDocuments(filter);

        return { amenities, total }
    }

    async separateHotelAndRoomAmenities(amenityIds: string[]): Promise<{ hotelAmenities: IAmenities[], roomAmenities: IAmenities[] }> {
        if (!amenityIds || amenityIds.length === 0) {
            return { hotelAmenities: [], roomAmenities: [] };
        }

        const amenities = await this.model.find({ _id: { $in: amenityIds }, isActive: true }).lean<IAmenities[]>();

        const hotelAmenities = amenities.filter(a => a.type === 'hotel');
        const roomAmenities = amenities.filter(a => a.type === 'room');

        return { hotelAmenities, roomAmenities };
    }
}