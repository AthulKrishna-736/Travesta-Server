import { inject, injectable } from "tsyringe";
import { IGetActiveAmenitiesUseCase, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class GetActiveAmenitiesUseCase implements IGetActiveAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenityRepo: IAmenitiesRepository,
    ) { }

    async getActiveAmenities(): Promise<{ amenities: TResponseAmenityData[], message: string, total: number }> {
        const { amenities, total } = await this._amenityRepo.getQuery({ isActive: true });

        if (!amenities) {
            throw new AppError('no amenities found', HttpStatusCode.NOT_FOUND);
        }

        return {
            amenities,
            message: total > 0
                ? AMENITIES_RES_MESSAGES.getActive
                : 'No active amenities found.',
            total
        };
    }

}