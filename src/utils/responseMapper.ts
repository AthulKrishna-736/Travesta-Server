import { IUser } from "../domain/interfaces/model/user.interface";
import { ResponseUserDTO } from "../interfaceAdapters/dtos/user.dto";
import { IHotel } from "../domain/interfaces/model/hotel.interface";
import { ResponseHotelDTO } from "../interfaceAdapters/dtos/hotel.dto";


export function mapUserToResponseDTO(user: Omit<IUser, 'password'>): ResponseUserDTO {
    return {
        id: user._id!,
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
