import { TRoomType, TDiscountType } from "../../domain/interfaces/model/offer.interface";

export type TCreateOfferDTO = {
    vendorId: string;
    name: string;
    hotelId?: string;
    roomType: TRoomType;
    discountType: TDiscountType;
    discountValue: number;
    startDate: string;
    expiryDate: string;
};

export type TUpdateOfferDTO = {
    hotelId?: string | null;
    name?: string;
    roomType?: TRoomType;
    discountType?: TDiscountType;
    discountValue?: number;
    startDate?: string;
    expiryDate?: string;
    isBlocked?: boolean;
};

export type TResponseOfferDTO = {
    id: string;
    vendorId: string;
    name: string;
    hotelId: string | null;
    roomType: TRoomType;
    discountType: TDiscountType;
    discountValue: number;
    startDate: string;
    expiryDate: string;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type TDetectOfferInput = {
    vendorId: string;
    hotelId?: string | null;
    roomType: TRoomType;
    date?: string;
    basePrice?: number;
};

export type TDetectOfferResult = {
    bestOffer?: TResponseOfferDTO | null;
    finalPrice?: number | null;
    applicableOffers: TResponseOfferDTO[];
};
