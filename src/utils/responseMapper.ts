import { IUser } from "../domain/interfaces/model/user.interface";
import { ResponseUserDTO } from "../interfaceAdapters/dtos/user.dto";
import { IHotel } from "../domain/interfaces/model/hotel.interface";
import { ResponseHotelDTO } from "../interfaceAdapters/dtos/hotel.dto";
import { ISubscription } from "../domain/interfaces/model/subscription.interface";
import { TResponseSubscriptionDTO } from "../interfaceAdapters/dtos/subscription.dto";

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
}


export function mapUserToResponseDTO(user: Omit<IUser, 'password'> & { id?: string }): ResponseUserDTO {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isGoogle: user.isGoogle,
        phone: user.phone,
        isBlocked: user.isBlocked,
        role: user.role,
        profileImage: user.profileImage,
        wishlist: user.wishlist ?? [],
        subscriptionType: user.subscriptionType,
        kycDocuments: user.kycDocuments ?? [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}


export function mapHotelToResponseDTO(hotel: IHotel): ResponseHotelDTO {
    return {
        id: hotel._id!,
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
