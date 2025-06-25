import { IUser } from "../domain/interfaces/model/user.interface";
import { ResponseUserDTO } from "../interfaceAdapters/dtos/user.dto";
import { IHotel } from "../domain/interfaces/model/hotel.interface";
import { TResponseHotelDTO } from "../interfaceAdapters/dtos/hotel.dto";
import { ISubscription } from "../domain/interfaces/model/subscription.interface";
import { TResponseSubscriptionDTO } from "../interfaceAdapters/dtos/subscription.dto";
import { IRoom } from "../domain/interfaces/model/room.interface";
import { TResponseRoomDTO } from "../interfaceAdapters/dtos/room.dto";

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
            capacity: room.capacity,
            bedType: room.bedType,
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
            vendorId: hotel.vendorId.toString(),
            name: hotel.name,
            description: hotel.description,
            images: hotel.images,
            rating: hotel.rating ?? 0,
            services: hotel.services,
            amenities: hotel.amenities,
            tags: hotel.tags,
            state: hotel.state,
            city: hotel.city,
            address: hotel.address,
            geoLocation: hotel.geoLocation,
            isBlocked: hotel.isBlocked,
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
        };
    }
}


export function mapUserToResponseDTO(user: Omit<IUser, 'password'> & { id?: string }): ResponseUserDTO {
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isGoogle: user.isGoogle,
        phone: user.phone,
        isBlocked: user.isBlocked,
        role: user.role,
        profileImage: user.profileImage,
        wishlist: user.wishlist ?? [],
        subscription: user.subscription,
        kycDocuments: user.kycDocuments ?? [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}
