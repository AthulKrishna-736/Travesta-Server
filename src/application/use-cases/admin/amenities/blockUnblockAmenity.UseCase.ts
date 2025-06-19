import { inject, injectable } from "tsyringe";
import { IBlockUnblockAmenityUseCase, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { AmenityLookupBase } from "../../base/amenity.base";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";


@injectable()
export class BlockUnblockAmenity extends AmenityLookupBase implements IBlockUnblockAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) amenitiesRepo: IAmenitiesRepository,
    ) {
        super(amenitiesRepo);
    }

    async blockUnblockAmenityUseCase(amenityId: string): Promise<{ amenity: TResponseAmenityData, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        if (amenityEntity.isActive) {
            amenityEntity.block();
        } else {
            amenityEntity.unblock();
        }

        const updateAmenity = await this._amenityRepo.updateAmenity(amenityEntity.id, amenityEntity.getPersistableData());

        if (!updateAmenity) {
            throw new AppError('failed to block/unblock amenity', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            amenity: amenityEntity.toObject(),
            message: `amenity ${amenityEntity.isActive ? 'unblocked' : 'blocked'} successfully`
        }
    }
}