import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { ICreateAmenityUseCase } from "../../../domain/interfaces/model/amenities.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../constants/resMessages";
import { AMENITIES_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TCreateAmenityDTO, TResponseAmenityDTO } from "../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../utils/responseMapper";


@injectable()
export class CreateAmenityUseCase implements ICreateAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepository: IAmenitiesRepository,
    ) { }

    async createAmenity(data: TCreateAmenityDTO): Promise<{ amenity: TResponseAmenityDTO, message: string }> {
        const amenity = await this._amenitiesRepository.createAmenity(data);

        if (!amenity) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedAmenity = ResponseMapper.mapAmenityToResponseDTO(amenity);

        return {
            amenity: mappedAmenity,
            message: AMENITIES_RES_MESSAGES.create,
        };
    }
}