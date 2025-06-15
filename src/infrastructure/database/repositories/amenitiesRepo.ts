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

    async findAllAmenities(): Promise<IAmenities[] | null> {
        const amenities = await this.find({ isActive: true }).lean<IAmenities[]>()
        return amenities
    }
}