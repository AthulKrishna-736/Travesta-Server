import { inject, injectable } from "tsyringe";
import { AmenityLookupBase } from "../../base/amenity.base";
import { IGetAmenityByIdUseCase } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";
import { TResponseAmenityDTO } from "../../../../interfaceAdapters/dtos/amenity.dto";
import { ResponseMapper } from "../../../../utils/responseMapper";


@injectable()
export class GetAmenityByIdUseCase extends AmenityLookupBase implements IGetAmenityByIdUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) _amenitiesRepository: IAmenitiesRepository,
    ) {
        super(_amenitiesRepository);
    }

    async getAmenityById(amenityId: string): Promise<{ amenity: TResponseAmenityDTO, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        const mappedAmenity = ResponseMapper.mapAmenityToResponseDTO(amenityEntity.toObject());

        return {
            amenity: mappedAmenity,
            message: AMENITIES_RES_MESSAGES.getOne,
        }
    }
}