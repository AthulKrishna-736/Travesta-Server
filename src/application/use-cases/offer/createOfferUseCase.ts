import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import { TOKENS } from "../../../constants/token";
import { TCreateOfferDTO, TResponseOfferDTO } from "../../../interfaceAdapters/dtos/offer.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import mongoose from "mongoose";
import { ICreateOfferUseCase } from "../../../domain/interfaces/model/offer.interface";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class CreateOfferUseCase implements ICreateOfferUseCase {
    constructor(
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository,
    ) { }

    async createOffer(data: TCreateOfferDTO): Promise<{ offer: TResponseOfferDTO, message: string }> {
        const FinalCreateObject = {
            ...data,
            hotelId: data.hotelId ? new mongoose.Types.ObjectId(data.hotelId) : undefined,
            startDate: new Date(data.startDate),
            expiryDate: new Date(data.expiryDate),
        };

        const hasConflict = await this._offerRepository.checkOfferOverlap(data.vendorId, data.roomType, new Date(data.startDate), new Date(data.expiryDate), data.hotelId || null);
        if (hasConflict) {
            throw new AppError("An overlapping offer already exists for this room type / hotel.", HttpStatusCode.BAD_REQUEST);
        }

        const created = await this._offerRepository.createOffer(FinalCreateObject);
        if (!created) throw new AppError("Failed to create offer", HttpStatusCode.INTERNAL_SERVER_ERROR);

        const mappedOffer = ResponseMapper.mapOfferResponseToDTO(created);
        return {
            offer: mappedOffer,
            message: "Created offer successfully"
        };
    }
}

