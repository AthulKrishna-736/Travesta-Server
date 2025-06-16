import { inject, injectable } from "tsyringe";
import { AmenityLookupBase } from "../../base/amenity.base";
import { IGetAllAmenitiesUseCase, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";


@injectable()
export class GetAllAmenitiesUseCase extends AmenityLookupBase implements IGetAllAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) amenitiesRepo: IAmenitiesRepository,
    ) {
        super(amenitiesRepo)
    }

    async getAllAmenitiesUseCase(): Promise<{ amenities: TResponseAmenityData[]; message: string; }> {
        const amenities = await this.getAllAmenitiesOrThrow();

        const mappedAmenityEnitites = amenities.map(a => a.toObject());

        return {
            amenities: mappedAmenityEnitites,
            message: 'fetched amenities successfully',
        }
    }
}