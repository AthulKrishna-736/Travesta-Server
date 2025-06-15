import { AmenitiesEntity, IAmenitiesEntity } from "../../../domain/entities/admin/amenities.entity";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export abstract class AmenityLookupBase {
    constructor(protected readonly _amenityRepo: IAmenitiesRepository) { }

    protected async getAmenityByIdOrThrow(amenityId: string): Promise<IAmenitiesEntity> {
        const amenityData = await this._amenityRepo.findAmenityById(amenityId);

        if (!amenityData) {
            throw new AppError('amenity not found', HttpStatusCode.BAD_REQUEST);
        }

        return new AmenitiesEntity(amenityData);
    }

    protected async getAllAmenitiesOrThrow(): Promise<IAmenitiesEntity[]> {
        const amenities = await this._amenityRepo.findAllAmenities();

        if (!amenities) {
            throw new AppError('amenities not found', HttpStatusCode.BAD_REQUEST);
        }

        if (amenities.length == 0) {
            throw new AppError('No amenities to fetch. Please create one', HttpStatusCode.BAD_REQUEST);
        }

        const amenitiesEntity = amenities.map(a => new AmenitiesEntity(a));
        return amenitiesEntity;
    }
}