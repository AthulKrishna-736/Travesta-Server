import { inject, injectable } from "tsyringe";
import { IGetActiveAmenitiesUseCase } from "../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../constants/token";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../constants/resMessages";
import { AMENITIES_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TResponseAmenityDTO } from "../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../utils/responseMapper";


@injectable()
export class GetActiveAmenitiesUseCase implements IGetActiveAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenityRepository: IAmenitiesRepository,
    ) { }

    async getActiveAmenities(): Promise<{ amenities: TResponseAmenityDTO[], message: string, total: number }> {
        const { amenities, total } = await this._amenityRepository.getActiveAmenities();

        if (!amenities || amenities.length == 0) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedAmenities = amenities.map(a => ResponseMapper.mapAmenityToResponseDTO(a));

        return {
            amenities: mappedAmenities,
            message: total > 0
                ? AMENITIES_RES_MESSAGES.getActive
                : 'No active amenities found.',
            total
        };
    }

}