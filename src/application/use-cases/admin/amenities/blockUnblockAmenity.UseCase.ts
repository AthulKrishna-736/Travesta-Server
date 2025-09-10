import { inject, injectable } from "tsyringe";
import { IBlockUnblockAmenityUseCase, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { AmenityLookupBase } from "../../base/amenity.base";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class BlockUnblockAmenity extends AmenityLookupBase implements IBlockUnblockAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) _amenityRepository: IAmenitiesRepository,
    ) {
        super(_amenityRepository);
    }

    async blockUnblockAmenityUseCase(amenityId: string): Promise<{ amenity: TResponseAmenityData, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        if (amenityEntity.isActive) {
            amenityEntity.block();
        } else {
            amenityEntity.unblock();
        }

        const updateAmenity = await this._amenityRepository.updateAmenity(amenityEntity.id, amenityEntity.getPersistableData());

        if (!updateAmenity) {
            throw new AppError('failed to block/unblock amenity', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            amenity: amenityEntity.toObject(),
            message: `amenity ${amenityEntity.isActive ? AMENITIES_RES_MESSAGES.unblock : AMENITIES_RES_MESSAGES.unblock}`
        }
    }
}