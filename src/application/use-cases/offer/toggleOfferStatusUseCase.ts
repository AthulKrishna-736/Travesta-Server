import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import { TOKENS } from "../../../constants/token";
import { TResponseOfferDTO } from "../../../interfaceAdapters/dtos/offer.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { IToggleOfferStatusUseCase } from "../../../domain/interfaces/model/offer.interface";

@injectable()
export class ToggleOfferStatusUseCase implements IToggleOfferStatusUseCase {
    constructor(
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository
    ) { }

    async toggleOfferStatus(offerId: string): Promise<{ offer: TResponseOfferDTO, message: string }> {
        const toggled = await this._offerRepository.toggleOfferStatus(offerId);
        if (!toggled) throw new AppError("Offer not found", HttpStatusCode.NOT_FOUND);

        const mappedOffer = ResponseMapper.mapOfferResponseToDTO(toggled);

        return {
            offer: mappedOffer,
            message: "Toggled offer status"
        };
    }
}
