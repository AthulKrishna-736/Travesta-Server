import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IAmenitiesRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { ICreateAmenityUseCase, TCreateAmenityData, TResponseAmenityData } from "../../../../domain/interfaces/model/amenities.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";
import { AMENITIES_RES_MESSAGES } from "../../../../constants/resMessages";


@injectable()
export class CreateAmenityUseCase implements ICreateAmenityUseCase {
    constructor(
        @inject(TOKENS.AmenitiesRepository) private _amenitiesRepo: IAmenitiesRepository,
    ) { }

    async createAmenity(data: TCreateAmenityData): Promise<{ amenity: TResponseAmenityData, message: string }> {
        const amenity = await this._amenitiesRepo.createAmenity(data);

        if (!amenity) {
            throw new AppError('Failed to create amenity', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            amenity,
            message: AMENITIES_RES_MESSAGES.create,
        };
    }
}