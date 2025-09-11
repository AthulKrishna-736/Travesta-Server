import { inject, injectable } from "tsyringe";
import { AmenityLookupBase } from "../../base/amenity.base";
import { IGetAllAmenitiesUseCase, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";

@injectable()
export class GetAllAmenitiesUseCase extends AmenityLookupBase implements IGetAllAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) _amenitiesRepository: IAmenitiesRepository,
    ) {
        super(_amenitiesRepository)
    }

    async getAllAmenitiesUseCase(page: number, limit: number, type: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: TResponseAmenityData[], message: string, total: number }> {

        const { amenities, total } = await this.getAllAmenitiesOrThrow(page, limit, type, search, sortField, sortOrder);

        const mappedAmenityEntities = amenities.map(a => a.toObject());

        return {
            amenities: mappedAmenityEntities,
            message: mappedAmenityEntities.length > 0
                ? AMENITIES_RES_MESSAGES.getAll
                : AMENITIES_RES_MESSAGES.notFound,
            total
        };
    }
}