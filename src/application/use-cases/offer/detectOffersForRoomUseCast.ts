import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import { TOKENS } from "../../../constants/token";
import { TDetectOfferInput, TDetectOfferResult, TResponseOfferDTO } from "../../../interfaceAdapters/dtos/offer.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { IDetectOfferForRoomUseCase } from "../../../domain/interfaces/model/offer.interface";

@injectable()
export class DetectOfferForRoomUseCase implements IDetectOfferForRoomUseCase {
    constructor(
        @inject(TOKENS.OfferRepository) private _offerRepository: IOfferRepository
    ) { }


    async detectOffersForRoom(input: TDetectOfferInput): Promise<TDetectOfferResult> {
        const date = input.date ? new Date(input.date) : new Date();
        const hotelId = input.hotelId ?? null;

        const offers = await this._offerRepository.findApplicableOffers(input.roomType, date, hotelId);

        if (!offers || offers.length == 0) {
            throw new AppError('No offer found', HttpStatusCode.NOT_FOUND);
        }

        const mappedOffers = offers.map(ResponseMapper.mapOfferResponseToDTO);

        if (!input.basePrice || mappedOffers.length === 0) {
            return { applicableOffers: mappedOffers, bestOffer: mappedOffers[0] || null, finalPrice: null };
        }

        const base = input.basePrice;
        let best: { offer: TResponseOfferDTO, finalPrice: number } | null = null;

        for (const o of mappedOffers) {
            let final = base;
            if (o.discountType === 'flat') {
                final = base - o.discountValue;
            } else {
                final = base - (base * (o.discountValue / 100));
            }
            if (final < 0) final = 0;

            if (!best || final < best.finalPrice) {
                best = { offer: o, finalPrice: final };
            }
        }

        return {
            applicableOffers: mappedOffers,
            bestOffer: best?.offer ?? null,
            finalPrice: best?.finalPrice ?? null
        };
    }
}
