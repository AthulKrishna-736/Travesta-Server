import { Types } from "mongoose"
import { TCreateOfferDTO, TDetectOfferInput, TDetectOfferResult, TResponseOfferDTO, TUpdateOfferDTO } from "../../../interfaceAdapters/dtos/offer.dto";

export type TRoomType = 'AC' | 'Non-AC' | 'Deluxe' | 'Suite' | 'Standard';
export type TDiscountType = 'flat' | 'percent';

export interface IOffer {
    _id?: string;
    name: string;
    vendorId: Types.ObjectId | string;
    hotelId?: Types.ObjectId;
    roomType: TRoomType;
    discountType: TDiscountType;
    discountValue: number;
    startDate: Date;
    expiryDate: Date;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface ICreateOfferUseCase {
    createOffer(data: TCreateOfferDTO): Promise<{ offer: TResponseOfferDTO, message: string }>;
}

export interface IUpdateOfferUseCase {
    updateOffer(offerId: string, data: TUpdateOfferDTO): Promise<{ offer: TResponseOfferDTO | null, message: string }>;
}

export interface IGetVendorOffersUseCase {
    getVendorOffers(vendorId: string, page: number, limit: number, search?: string): Promise<{ offers: TResponseOfferDTO[], total: number, message: string }>;
}

export interface IDetectOfferForRoomUseCase {
    detectOffersForRoom(input: TDetectOfferInput): Promise<TDetectOfferResult>;
}

export interface IToggleOfferStatusUseCase {
    toggleOfferStatus(offerId: string): Promise<{ offer: TResponseOfferDTO, message: string }>;
}
