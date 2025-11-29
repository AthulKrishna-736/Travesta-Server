import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import { TOKENS } from "../../../constants/token";
import { TUpdateOfferDTO, TResponseOfferDTO } from "../../../interfaceAdapters/dtos/offer.dto";
import { Types } from "mongoose";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { IUpdateOfferUseCase } from "../../../domain/interfaces/model/offer.interface";

@injectable()
export class UpdateOfferUseCase implements IUpdateOfferUseCase {
    constructor(
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository
    ) { }

    async updateOffer(offerId: string, data: TUpdateOfferDTO): Promise<{ offer: TResponseOfferDTO | null, message: string }> {
        const finalUpdateObject = {
            ...data,
            hotelId: data.hotelId ? new Types.ObjectId(data.hotelId) : undefined,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        };

        const updated = await this._offerRepository.updateOffer(offerId, finalUpdateObject);
        if (!updated) throw new AppError("Offer not found or couldn't update", HttpStatusCode.NOT_FOUND);

        const mappedOffer = ResponseMapper.mapOfferResponseToDTO(updated);

        return {
            offer: mappedOffer,
            message: "Updated offer successfully"
        };
    }
}
