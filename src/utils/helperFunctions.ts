import { IOffer, TDiscountType } from "../domain/interfaces/model/offer.interface";

export function formatDateString(dateStr: string): string {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const DYNAMIC_PRICE = [
    { range: [0.3, 0.5], percentage: 1.1 },
    { range: [0.5, 0.7], percentage: 1.2 },
    { range: [0.7, 0.9], percentage: 1.3 },
    { range: [0.9, 1], percentage: 1.4 },
]

const GST_PRICE = [
    { range: [0, 1000], percentage: 0 },
    { range: [1000, 7500], percentage: 5 },
    { range: [7500, Infinity], percentage: 18 },
]

export const calculateDynamicPricing = (roomPrice: number, totalRooms: number, bookedRooms: number): number => {
    const occupancyRate = bookedRooms / totalRooms;

    const getPercent = DYNAMIC_PRICE.find((i) => {
        return occupancyRate >= i.range[0] && occupancyRate >= i.range[1];
    });

    return getPercent ? Math.round(roomPrice * getPercent.percentage) : roomPrice;
}


export const calculateGSTPrice = (roomPrice: number): number => {
    const getPercent = GST_PRICE.find((i) => {
        return roomPrice >= i.range[0] && roomPrice <= i.range[1];
    });

    return getPercent ? Math.round(roomPrice / 100) * getPercent.percentage : 0;
}


export const getPropertyTime = (checkIn: string, checkOut: string, hotelCheckInTime: string, hotelCheckOutTime: string): { checkInDate: Date, checkOutDate: Date } => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const checkInTime = hotelCheckInTime.split(':').map(Number);
    const checkOutTime = hotelCheckOutTime.split(':').map(Number);

    checkInDate.setHours(checkInTime[0], checkInTime[1], 0, 0);
    checkOutDate.setHours(checkOutTime[0], checkOutTime[1], 0, 0);

    return {
        checkInDate,
        checkOutDate,
    }
}

export function applyOfferToPrice(basePrice: number, offer: Partial<IOffer> & { discountType?: TDiscountType, discountValue?: number }): number {
    if (!offer || !offer.discountType || offer.discountValue == null) return basePrice;

    let final = basePrice;
    if (offer.discountType === "flat") {
        final = basePrice - (offer.discountValue as number);
    } else { // percent
        final = basePrice - (basePrice * ((offer.discountValue as number) / 100));
    }

    if (final < 0) final = 0;
    // round to two decimals (optional)
    return Math.round(final * 100) / 100;
}

export function pickBestOfferForPrice(basePrice: number, offers: (IOffer | null | undefined)[]) {
    let bestOffer = null;
    let bestPrice = basePrice;

    for (const o of offers) {
        if (!o) continue;
        const price = applyOfferToPrice(basePrice, o);
        if (price < bestPrice) {
            bestPrice = price;
            bestOffer = o;
        }
    }

    return { offer: bestOffer, finalPrice: Math.round(bestPrice * 100) / 100 };
}

