import { inject, injectable } from "tsyringe";
import { IAmenities, IFindUsedActiveAmenitiesUseCase } from "../../../../domain/interfaces/model/amenities.interface";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";

@injectable()
export class FindUsedActiveAmenitiesUseCase implements IFindUsedActiveAmenitiesUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenityRepo: IAmenitiesRepository,
    ) { }

    async findUsedActiveAmenities(): Promise<{ amenities: IAmenities[], message: string, total: number }> {
        const amenities = await this._amenityRepo.findUsedActiveAmenities();

        if (!amenities || amenities.length === 0) {
            throw new AppError("No used active amenities found", HttpStatusCode.NOT_FOUND);
        }

        return {
            amenities,
            message: "Fetched used active amenities successfully.",
            total: amenities.length
        };
    }
}
