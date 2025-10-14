import { inject, injectable } from "tsyringe";
import { IAmenities, IBlockUnblockAmenityUseCase } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";
import { AMENITIES_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { TResponseAmenityDTO } from "../../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class BlockUnblockAmenity implements IBlockUnblockAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenityRepository: IAmenitiesRepository,
    ) { }

    async blockUnblockAmenityUseCase(amenityId: string): Promise<{ amenity: TResponseAmenityDTO, message: string }> {
        const amenity = await this._amenityRepository.findAmenityById(amenityId);

        if (!amenity) {
            throw new AppError(AMENITIES_RES_MESSAGES.notFound, HttpStatusCode.NOT_FOUND)
        }

        let updatedAmenity;
        if (amenity.isActive) {
            updatedAmenity = await this._amenityRepository.changeAmenityStatus(amenity._id, !amenity.isActive)
        } else {
            updatedAmenity = await this._amenityRepository.changeAmenityStatus(amenity._id, !amenity.isActive)
        }

        if (!updatedAmenity) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedAmenity = ResponseMapper.mapAmenityToResponseDTO(updatedAmenity);

        return {
            amenity: mappedAmenity,
            message: `amenity ${amenity.isActive ? AMENITIES_RES_MESSAGES.unblock : AMENITIES_RES_MESSAGES.unblock}`
        }
    }
}