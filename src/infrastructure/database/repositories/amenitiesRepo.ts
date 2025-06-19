import { injectable } from "tsyringe";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { amenitiesModel, TAmenitiesDocument } from "../models/amenitiesModel";
import { BaseRepository } from "./baseRepo";
import { IAmenities, TCreateAmenityData, TUpdateAmenityData } from "../../../domain/interfaces/model/amenities.interface";

@injectable()
export class AmenitiesRepository extends BaseRepository<TAmenitiesDocument> implements IAmenitiesRepository {
    constructor() {
        super(amenitiesModel);
    }

    async createAmenity(data: TCreateAmenityData): Promise<IAmenities | null> {
        const amenity = await this.create(data);
        return amenity.toObject();
    }

    async updateAmenity(id: string, data: TUpdateAmenityData): Promise<IAmenities | null> {
        const amenity = await this.update(id, data);
        return amenity?.toObject() || null;
    }

    async findAmenityById(id: string): Promise<IAmenities | null> {
        const amenity = await this.findById(id);
        return amenity?.toObject() || null;
    }

    async findAllAmenities(page: number, limit: number, search?: string): Promise<{ amenities: IAmenities[] | null, total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = {}
        if (search) {
            const searchRegex = new RegExp(search, 'i')
            filter.$or = [
                { name: searchRegex },
            ]
        }

        const total = await this.model.countDocuments(filter);
        const amenities = await this.find(filter).skip(skip).limit(limit).lean<IAmenities[]>();
        return { amenities, total }
    }

    async getQuery(filter: any = {}): Promise<{ amenities: IAmenities[], total: number }> {
        const amenities = await this.find(filter);
        const total = await this.model.countDocuments(filter);

        return {
            amenities,
            total,
        }
    }
}