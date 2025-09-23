import { inject, injectable } from "tsyringe";
import { IUpdateAmenityUseCase, TResponseAmenityData, TUpdateAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AmenityLookupBase } from "../../base/amenity.base";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";
import { AMENITIES_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseAmenityDTO, TUpdateAmenityDTO } from "../../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class UpdateAmenityUseCase extends AmenityLookupBase implements IUpdateAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) _amenitiesRepository: IAmenitiesRepository,
    ) {
        super(_amenitiesRepository);
    }

    async updateAmenity(amenityId: string, data: TUpdateAmenityDTO): Promise<{ amenity: TResponseAmenityDTO, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        amenityEntity.update(data);

        const updatedAmenity = await this._amenityRepository.updateAmenity(amenityEntity.id, amenityEntity.getPersistableData());

        if (!updatedAmenity) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedAmenity = ResponseMapper.mapAmenityToResponseDTO(amenityEntity.toObject());

        return {
            amenity: mappedAmenity,
            message: AMENITIES_RES_MESSAGES.update,
        }
    }
}

