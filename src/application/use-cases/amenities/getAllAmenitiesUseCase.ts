import { inject, injectable } from "tsyringe";
import { IGetAllAmenitiesUseCase } from "../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../constants/token";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AMENITIES_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseAmenityDTO } from "../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AppError } from "../../../utils/appError";
import { AMENITIES_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetAllAmenitiesUseCase implements IGetAllAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepository: IAmenitiesRepository,
    ) { }

    async getAllAmenitiesUseCase(page: number, limit: number, type: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: TResponseAmenityDTO[], message: string, total: number }> {

        const { amenities, total } = await this._amenitiesRepository.findAllAmenities(page, limit, type, search, sortField, sortOrder);

        if (!amenities || amenities.length == 0) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedAmenities = amenities.map(a => ResponseMapper.mapAmenityToResponseDTO(a));

        return {
            amenities: mappedAmenities,
            message: mappedAmenities.length > 0
                ? AMENITIES_RES_MESSAGES.getAll
                : AMENITIES_RES_MESSAGES.notFound,
            total,
        };
    }
}