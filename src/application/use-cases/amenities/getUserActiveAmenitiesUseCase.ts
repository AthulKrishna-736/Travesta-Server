import { inject, injectable } from "tsyringe";
import { IFindUsedActiveAmenitiesUseCase } from "../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../constants/token";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../constants/resMessages";
import { AMENITIES_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TResponseAmenityDTO } from "../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class FindUsedActiveAmenitiesUseCase implements IFindUsedActiveAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenityRepository: IAmenitiesRepository,
    ) { }

    async findUsedActiveAmenities(): Promise<{ amenities: TResponseAmenityDTO[], message: string, total: number }> {
        const amenities = await this._amenityRepository.findUsedActiveAmenities();

        if (!amenities || amenities.length === 0) {
            throw new AppError(AMENITIES_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedAmenities = amenities.map((a) => ResponseMapper.mapAmenityToResponseDTO(a));

        return {
            amenities: mappedAmenities,
            message: AMENITIES_RES_MESSAGES.getUsed,
            total: amenities.length
        };
    }
}
