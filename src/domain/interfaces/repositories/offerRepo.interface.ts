import { IOffer } from "../model/offer.interface";

export interface IOfferRepository {
    createOffer(data: Partial<IOffer>): Promise<IOffer | null>;
    updateOffer(offerId: string, data: Partial<IOffer>): Promise<IOffer | null>;
    findOfferById(offerId: string): Promise<IOffer | null>;
    getVendorOffers(vendorId: string, page: number, limit: number, search?: string): Promise<{ offers: IOffer[], total: number }>;
    findApplicableOffers(roomType: string, date: Date, hotelId: string | null): Promise<IOffer[]>;
    toggleOfferStatus(offerId: string): Promise<IOffer | null>;
    checkOfferOverlap(vendorId: string, roomType: string, startDate: Date, expiryDate: Date, hotelId?: string | null, excludeOfferId?: string): Promise<boolean>
}
