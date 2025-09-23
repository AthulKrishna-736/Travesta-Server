import { inject, injectable } from "tsyringe";
import { IBlockUnblockAmenityUseCase } from "../../../../domain/interfaces/model/amenities.interface";
import { AmenityLookupBase } from "../../base/amenity.base";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";
import { AMENITIES_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseAmenityDTO } from "../../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class BlockUnblockAmenity extends AmenityLookupBase implements IBlockUnblockAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) _amenityRepository: IAmenitiesRepository,
    ) {
        super(_amenityRepository);
    }

    async blockUnblockAmenityUseCase(amenityId: string): Promise<{ amenity: TResponseAmenityDTO, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        if (amenityEntity.isActive) {
            amenityEntity.block();
        } else {
            amenityEntity.unblock();
        }

        const updateAmenity = await this._amenityRepository.updateAmenity(amenityEntity.id, amenityEntity.getPersistableData());

        if (!updateAmenity) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.blockFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedAmenity = ResponseMapper.mapAmenityToResponseDTO(amenityEntity.toObject());

        return {
            amenity: mappedAmenity,
            message: `amenity ${amenityEntity.isActive ? AMENITIES_RES_MESSAGES.unblock : AMENITIES_RES_MESSAGES.unblock}`
        }
    }
}