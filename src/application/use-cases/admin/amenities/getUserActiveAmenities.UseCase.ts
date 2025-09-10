import { inject, injectable } from "tsyringe";
import { IAmenities, IFindUsedActiveAmenitiesUseCase } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../constants/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";

@injectable()
export class FindUsedActiveAmenitiesUseCase implements IFindUsedActiveAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenityRepository: IAmenitiesRepository,
    ) { }

    async findUsedActiveAmenities(): Promise<{ amenities: IAmenities[], message: string, total: number }> {
        const amenities = await this._amenityRepository.findUsedActiveAmenities();

        if (!amenities || amenities.length === 0) {
            throw new AppError("No used active amenities found", HttpStatusCode.NOT_FOUND);
        }

        return {
            amenities,
            message: AMENITIES_RES_MESSAGES.getUsed,
            total: amenities.length
        };
    }
}
