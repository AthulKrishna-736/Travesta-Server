import { AmenitiesEntity, IAmenitiesEntity } from "../../../domain/entities/admin/amenities.entity";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";


export abstract class AmenityLookupBase {
    constructor(protected readonly _amenityRepository: IAmenitiesRepository) { }

    protected async getAmenityByIdOrThrow(amenityId: string): Promise<IAmenitiesEntity> {
        const amenityData = await this._amenityRepository.findAmenityById(amenityId);

        if (!amenityData) {
            throw new AppError('amenity not found', HttpStatusCode.NOT_FOUND);
        }

        return new AmenitiesEntity(amenityData);
    }

    protected async getAllAmenitiesOrThrow(page: number, limit: number, type: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: IAmenitiesEntity[], total: number }> {
        const { amenities, total } = await this._amenityRepository.findAllAmenities(page, limit, type, search, sortField, sortOrder);

        if (!amenities) {
            throw new AppError('amenities not found', HttpStatusCode.NOT_FOUND);
        }

        const amenitiesEntity = amenities.map(a => new AmenitiesEntity(a));
        return { amenities: amenitiesEntity, total };
    }
}