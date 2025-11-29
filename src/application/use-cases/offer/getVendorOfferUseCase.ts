import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import { TOKENS } from "../../../constants/token";
import { TResponseOfferDTO } from "../../../interfaceAdapters/dtos/offer.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { IGetVendorOffersUseCase } from "../../../domain/interfaces/model/offer.interface";

@injectable()
export class GetVendorOffersUseCase implements IGetVendorOffersUseCase {
    constructor(
        @inject(TOKENS.OfferRepository) private _offerRepo: IOfferRepository
    ) { }

    async getVendorOffers(vendorId: string, page: number, limit: number, search?: string): Promise<{ offers: TResponseOfferDTO[], total: number, message: string }> {
        const { offers, total } = await this._offerRepo.getVendorOffers(vendorId, page, limit, search);

        if (!offers || offers.length == 0 || total == 0) {
            throw new AppError('No offer found. Please create one', HttpStatusCode.NOT_FOUND);
        }

        const mappedOffers = offers.map(ResponseMapper.mapOfferResponseToDTO)

        return {
            offers: mappedOffers,
            total,
            message: "Fetched vendor offers"
        };
    }
}
