import { IUser } from "../domain/interfaces/model/user.interface";
import { TResponseUserDTO } from "../interfaceAdapters/dtos/user.dto";
import { IHotel } from "../domain/interfaces/model/hotel.interface";
import { TResponseHotelDTO } from "../interfaceAdapters/dtos/hotel.dto";
import { ISubscription } from "../domain/interfaces/model/subscription.interface";
import { TResponseSubscriptionDTO } from "../interfaceAdapters/dtos/subscription.dto";
import { IRoom } from "../domain/interfaces/model/room.interface";
import { TResponseRoomDTO } from "../interfaceAdapters/dtos/room.dto";
import { ITransactions, IWallet } from "../domain/interfaces/model/wallet.interface";
import { IAmenities } from "../domain/interfaces/model/amenities.interface";
import { TResponseAmenityDTO } from "../interfaceAdapters/dtos/amenity.dto";
import { TResponseWalletDTO } from "../interfaceAdapters/dtos/wallet.dto";
import { TResponseTransactionDTO } from "../interfaceAdapters/dtos/transactions.dto";
import { IRating } from "../domain/interfaces/model/rating.interface";
import { TResponseRatingDTO } from "../interfaceAdapters/dtos/rating.dto";
import { ICoupon } from "../domain/interfaces/model/coupon.interface";
import { TResponseCouponDTO } from "../interfaceAdapters/dtos/coupon.dto";
import { IOffer } from "../domain/interfaces/model/offer.interface";
import { TResponseOfferDTO } from "../interfaceAdapters/dtos/offer.dto";
import { IBooking, TBookingPopulated } from "../domain/interfaces/model/booking.interface";
import { TResponseBookingDTO } from "../interfaceAdapters/dtos/booking.dto";
import { formatDateString } from "./helperFunctions";

export class ResponseMapper {
    static mapSubscriptionToResponseDTO(plan: ISubscription): TResponseSubscriptionDTO {
        return {
            id: plan._id as string,
            name: plan.name,
            description: plan.description,
            type: plan.type,
            duration: plan.duration,
            isActive: plan.isActive,
            price: plan.price,
            features: plan.features,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
        }
    }

    static mapRoomToResponseDTO(room: IRoom & { gstPrice?: number }): TResponseRoomDTO {
        return {
            id: room._id as string,
            hotelId: room.hotelId,
            name: room.name,
            roomType: room.roomType,
            roomCount: room.roomCount,
            bedType: room.bedType,
            guest: room.guest,
            amenities: room.amenities,
            images: room.images,
            basePrice: room.basePrice,
            gstPrice: room.gstPrice ?? 0,
            isAvailable: room.isAvailable,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
        }
    }

    static mapHotelToResponseDTO(hotel: IHotel): TResponseHotelDTO {
        return {
            id: hotel._id as string,
            vendorId: hotel.vendorId as string,
            name: hotel.name,
            description: hotel.description,
            images: hotel.images,
            amenities: hotel.amenities,
            tags: hotel.tags,
            state: hotel.state,
            city: hotel.city,
            address: hotel.address,
            geoLocation: hotel.geoLocation,
            isBlocked: hotel.isBlocked,
            rating: (hotel as any).rating,
            propertyRules: hotel.propertyRules,
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
        };
    }

    static mapUserToResponseDTO(user: IUser): TResponseUserDTO {
        return {
            id: user._id as string,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isGoogle: user.isGoogle,
            phone: user.phone,
            isBlocked: user.isBlocked,
            role: user.role,
            isVerified: user.isVerified,
            verificationReason: user.verificationReason,
            profileImage: user.profileImage,
            subscription: user.subscription?.toString()!,
            kycDocuments: user.kycDocuments ?? [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static mapAmenityToResponseDTO(amenity: IAmenities): TResponseAmenityDTO {
        return {
            id: amenity._id as string,
            name: amenity.name,
            type: amenity.type,
            description: amenity.description,
            isActive: amenity.isActive,
            createdAt: amenity.createdAt,
            updateAt: amenity.updatedAt,
        }
    }

    static mapWalletToResponseDTO(wallet: IWallet): TResponseWalletDTO {
        return {
            id: wallet._id as string,
            userId: wallet.userId.toString(),
            balance: wallet.balance,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        }
    }

    static mapTransactionToResponseDTO(transaction: ITransactions): TResponseTransactionDTO {
        return {
            id: transaction._id as string,
            walletId: transaction.walletId.toString(),
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            transactionId: transaction.transactionId ? transaction.transactionId : undefined,
            relatedEntityId: transaction.relatedEntityId ? transaction.relatedEntityId.toString() : undefined,
            relatedEntityType: transaction.relatedEntityType ? transaction.relatedEntityType : undefined,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        }
    }

    static mapRatingToResponseDTO(rating: IRating): TResponseRatingDTO {
        return {
            id: rating._id as string,
            hotelId: rating.hotelId.toString(),
            userId: rating.userId,
            hospitality: rating.hospitality,
            cleanliness: rating.cleanliness,
            facilities: rating.facilities,
            room: rating.room,
            moneyValue: rating.moneyValue,
            review: rating.review,
            images: rating.images,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        }
    }

    static mapCouponResponseToDTO(coupon: ICoupon): TResponseCouponDTO {
        return {
            id: coupon._id!.toString(),
            vendorId: coupon.vendorId.toString(),
            name: coupon.name,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minPrice: coupon.minPrice,
            maxPrice: coupon.maxPrice,
            count: coupon.count,
            startDate: formatDateString(coupon.startDate),
            endDate: formatDateString(coupon.endDate),
            isBlocked: coupon.isBlocked,
            createdAt: coupon.createdAt,
            updatedAt: coupon.updatedAt,
        }
    }

    static mapOfferResponseToDTO(offer: IOffer): TResponseOfferDTO {
        return {
            id: offer._id!.toString(),
            vendorId: offer.vendorId.toString(),
            name: offer.name,
            hotelId: offer.hotelId ? offer.hotelId.toString() : null,
            roomType: offer.roomType,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            startDate: formatDateString(offer.startDate),
            expiryDate: formatDateString(offer.expiryDate),
            isBlocked: offer.isBlocked,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
        };
    }

    static mapBookingResponseToDTO(booking: IBooking & { hotel?: TBookingPopulated['hotel'], room?: TBookingPopulated['room'] }): TResponseBookingDTO {
        return {
            id: booking._id!.toString(),
            userId: booking.userId,
            hotelId: booking.hotelId.toString(),
            roomId: booking.roomId.toString(),
            hotel: booking.hotel,
            room: booking.room,
            checkIn: formatDateString(booking.checkIn),
            checkOut: formatDateString(booking.checkIn),
            guests: booking.guests,
            totalPrice: booking.totalPrice,
            roomsCount: booking.roomsCount,
            couponId: booking.couponId?.toString(),
            status: booking.status,
            payment: booking.payment,
            createdAt: booking.checkIn,
            updatedAt: booking.updatedAt,
        }
    }
}
