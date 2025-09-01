import { inject, injectable } from "tsyringe";
import { AmenityLookupBase } from "../../base/amenity.base";
import { IGetAmenityByIdUseCase, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class GetAmenityByIdUseCase extends AmenityLookupBase implements IGetAmenityByIdUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) amenitiesRepo: IAmenitiesRepository,
    ) {
        super(amenitiesRepo);
    }

    async getAmenityById(amenityId: string): Promise<{ amenity: TResponseAmenityData, message: string }> {
        const amenityEntity = await this.getAmenityByIdOrThrow(amenityId);

        return {
            amenity: amenityEntity.toObject(),
            message: AMENITIES_RES_MESSAGES.getOne,
        }
    }
}