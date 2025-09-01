import { inject, injectable } from "tsyringe";
import { IUpdateAmenityUseCase, TResponseAmenityData, TUpdateAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AmenityLookupBase } from "../../base/amenity.base";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class UpdateAmenityUseCase extends AmenityLookupBase implements IUpdateAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) amenitiesRepo: IAmenitiesRepository,
    ) {
        super(amenitiesRepo);
    }

    async updateAmenity(amenityId: string, data: TUpdateAmenityData): Promise<{ amenity: TResponseAmenityData, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        amenityEntity.update(data);

        const updatedAmenity = await this._amenityRepo.updateAmenity(amenityEntity.id, amenityEntity.getPersistableData());

        if (!updatedAmenity) {
            throw new AppError('error while updating amenity', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            amenity: updatedAmenity,
            message: AMENITIES_RES_MESSAGES.update,
        }
    }
}

