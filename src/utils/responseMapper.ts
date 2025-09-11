import { IUser } from "../domain/interfaces/model/user.interface";
import { TResponseUserDTO } from "../interfaceAdapters/dtos/user.dto";
import { IHotel } from "../domain/interfaces/model/hotel.interface";
import { TResponseHotelDTO } from "../interfaceAdapters/dtos/hotel.dto";
import { ISubscription } from "../domain/interfaces/model/subscription.interface";
import { TResponseSubscriptionDTO } from "../interfaceAdapters/dtos/subscription.dto";
import { IRoom } from "../domain/interfaces/model/room.interface";
import { TResponseRoomDTO } from "../interfaceAdapters/dtos/room.dto";
import { ITransactions, TResponseTransactions } from "../domain/interfaces/model/wallet.interface";

export class ResponseMapper {
    static mapSubscriptionToResponseDTO(plan: ISubscription): TResponseSubscriptionDTO {
        return {
            id: plan._id,
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
            hotelId: room.hotelId.toString(),
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
            rating: hotel.rating ?? 0,
            amenities: hotel.amenities,
            tags: hotel.tags,
            state: hotel.state,
            city: hotel.city,
            address: hotel.address,
            geoLocation: hotel.geoLocation,
            isBlocked: hotel.isBlocked,
            startingPrice: (hotel as any).startingPrice ?? null,
            cheapestRoom: (hotel as any).cheapestRoom ?? null,
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
        };
    }

    static mapUserToResponseDTO(user: Omit<IUser, 'password'> & { id?: string }): TResponseUserDTO {
        return {
            id: user._id ?? user.id,
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
            wishlist: user.wishlist ?? [],
            subscription: user.subscription,
            kycDocuments: user.kycDocuments ?? [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static mapTransactionToResponseDTO(transactions: ITransactions): TResponseTransactions {
        return {
            _id: transactions._id,
            walletId: transactions.walletId,
            type: transactions.type,
            amount: transactions.amount,
            description: transactions.description,
            transactionId: transactions?.transactionId,
            relatedEntityId: transactions?.relatedEntityId,
            relatedEntityType: transactions?.relatedEntityType,
            createdAt: transactions.createdAt,
            updatedAt: transactions.updatedAt,
        }
    }
}
