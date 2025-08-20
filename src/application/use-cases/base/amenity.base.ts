import { AmenitiesEntity, IAmenitiesEntity } from "../../../domain/entities/admin/amenities.entity";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export abstract class AmenityLookupBase {
    constructor(protected readonly _amenityRepo: IAmenitiesRepository) { }

    protected async getAmenityByIdOrThrow(amenityId: string): Promise<IAmenitiesEntity> {
        const amenityData = await this._amenityRepo.findAmenityById(amenityId);

        if (!amenityData) {
            throw new AppError('amenity not found', HttpStatusCode.NOT_FOUND);
        }

        return new AmenitiesEntity(amenityData);
    }

    protected async getAllAmenitiesOrThrow(page: number, limit: number, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: IAmenitiesEntity[], total: number }> {
        const { amenities, total } = await this._amenityRepo.findAllAmenities(page, limit, search, sortField, sortOrder);

        if (!amenities) {
            throw new AppError('amenities not found', HttpStatusCode.NOT_FOUND);
        }

        const amenitiesEntity = amenities.map(a => new AmenitiesEntity(a));
        return { amenities: amenitiesEntity, total };
    }
}