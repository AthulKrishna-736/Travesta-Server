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

    async getAllAmenitiesUseCase(page: number, limit: number, search?: string): Promise<{ amenities: TResponseAmenityData[], message: string, total: number }> {
        const { amenities, total } = await this.getAllAmenitiesOrThrow(page, limit, search);

        const mappedAmenityEntities = amenities.map(a => a.toObject());

        return {
            amenities: mappedAmenityEntities,
            message: mappedAmenityEntities.length > 0
                ? 'Fetched amenities successfully.'
                : 'No amenities found. You can create one.',
            total
        };
    }
}