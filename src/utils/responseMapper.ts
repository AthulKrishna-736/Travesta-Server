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

    static mapRoomToResponseDTO(room: IRoom): TResponseRoomDTO {
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
            room: (hotel as any).cheapestRoom ?? null,
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
            subscription: user.subscription,
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
            userId: rating.userId.toString(),
            hospitality: rating.hospitality,
            cleanliness: rating.cleanliness,
            facilities: rating.facilities,
            room: rating.room,
            moneyValue: rating.moneyValue,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        }
    }
}
