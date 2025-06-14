import { injectable } from "tsyringe";
import { IAmenities } from "../../../domain/interfaces/model/admin.interface";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { amenitiesModel, TAmenitiesDocument } from "../models/amenitiesModel";
import { BaseRepository } from "./baseRepo";

@injectable()
export class AmenitiesRepository extends BaseRepository<TAmenitiesDocument> implements IAmenitiesRepository {
    constructor() {
        super(amenitiesModel);
    }

    async createAmenities(data: Partial<IAmenities>): Promise<IAmenities | null> {
        const amenity = await this.create(data);
        return amenity.toObject();
    }

    async updateAmenities(id: string, data: Partial<IAmenities>): Promise<IAmenities | null> {
        const amenity = await this.update(id, data);
        return amenity?.toObject() || null;
    }

    async findAmenityById(id: string): Promise<IAmenities | null> {
        const amenity = await this.findById(id);
        return amenity?.toObject() || null;
    }

    async findAllAmenities(): Promise<IAmenities[] | null> {
        const amenities = await this.find({ isActive: true }).lean<IAmenities[]>()
        return amenities
    }
}