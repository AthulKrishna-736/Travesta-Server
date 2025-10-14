import { inject, injectable } from "tsyringe";
import { IGetAmenityByIdUseCase } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";
import { TResponseAmenityDTO } from "../../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";
import { AppError } from "../../../../utils/appError";
import { AMENITIES_ERROR_MESSAGES } from "../../../../constants/errorMessages";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";


@injectable()
export class GetAmenityByIdUseCase implements IGetAmenityByIdUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepository: IAmenitiesRepository,
    ) { }

    async getAmenityById(amenityId: string): Promise<{ amenity: TResponseAmenityDTO, message: string }> {
        const amenity = await this._amenitiesRepository.findAmenityById(amenityId);

        if (!amenity) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedAmenity = ResponseMapper.mapAmenityToResponseDTO(amenity);

        return {
            amenity: mappedAmenity,
            message: AMENITIES_RES_MESSAGES.getOne,
        }
    }
}