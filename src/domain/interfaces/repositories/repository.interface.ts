import { TSubscription } from "../../../shared/types/client.types";
import { IAmenities, TCreateAmenityData, TUpdateAmenityData } from "../model/amenities.interface";
import { IChatMessage, TCreateChatMessage } from "../model/chat.interface";
import { IBooking, IHotel, IWallet, TCreateHotelData, TUpdateHotelData } from "../model/hotel.interface";
import { IRoom, TCreateRoomData, TUpdateRoomData } from "../model/room.interface";
import { ISubscription, TCreateSubscriptionData, TUpdateSubscriptionData } from "../model/subscription.interface";
import { IUser, TUpdateUserData, TUserRegistrationInput } from "../model/user.interface";

export interface IUserRepository {
  findUserById(id: string): Promise<IUser | null>;
  createUser(data: TUserRegistrationInput): Promise<IUser | null>;
  updateUser(id: string, data: TUpdateUserData): Promise<IUser | null>;
  findAllUser(page: number, limit: number, role: string, search?: string): Promise<{ users: IUser[] | null, total: number }>;
  findUser(email: string): Promise<IUser | null>
  subscribeUser(id: string, data: Pick<IUser, 'subscription'>): Promise<IUser | null>
}

//hotel repo
export interface IHotelRepository {
  createHotel(data: TCreateHotelData): Promise<IHotel | null>;
  findHotelById(id: string): Promise<IHotel | null>;
  updateHotel(id: string, data: TUpdateHotelData): Promise<IHotel | null>;
  findHotelsByVendor(vendorId: string): Promise<IHotel[] | null>;
  findAllHotels(page: number, limit: number, search?: string): Promise<{ hotels: IHotel[] | null; total: number }>;
}


export interface IRoomRepository {
  createRoom(data: TCreateRoomData): Promise<IRoom | null>;
  findRoomById(id: string): Promise<IRoom | null>;
  updateRoom(id: string, data: TUpdateRoomData): Promise<IRoom | null>;
  deleteRoom(id: string): Promise<boolean>;
  findRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
  findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
  findAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: IRoom[], total: number }>;
  findFilteredAvailableRooms(page: number, limit: number, minPrice?: number, maxPrice?: number, amenities?: string[], search?: string): Promise<{ rooms: IRoom[]; total: number }>;
}

export interface IBookingRepository {
  createBooking(data: Partial<IBooking>): Promise<IBooking | null>;
  findBookingsByUser(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
  findBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>
  isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
  findByid(id: string): Promise<IBooking | null>;
  save(booking: IBooking): Promise<void>;
}

//amenities repo
export interface IAmenitiesRepository {
  createAmenity(data: TCreateAmenityData): Promise<IAmenities | null>
  findAmenityById(id: string): Promise<IAmenities | null>
  updateAmenity(id: string, data: TUpdateAmenityData): Promise<IAmenities | null>
  findAllAmenities(page: number, limit: number, search?: string): Promise<{ amenities: IAmenities[] | null, total: number }>
  getQuery(filter: any): Promise<{ amenities: IAmenities[] | null, total: number }>
}


//subscription repo
export interface ISubscriptionRepository {
  createPlan(data: TCreateSubscriptionData): Promise<ISubscription | null>
  updatePlan(id: string, data: TUpdateSubscriptionData): Promise<ISubscription | null>
  findPlanById(id: string): Promise<ISubscription | null>
  findPlanByType(type: TSubscription): Promise<ISubscription | null>
  findAllPlans(): Promise<ISubscription[] | null>
  findActivePlans(): Promise<ISubscription[] | null>
}

//chat repo
export interface IChatRepository {
  findMsgById(messageId: string): Promise<IChatMessage | null>
  createMessage(data: TCreateChatMessage): Promise<IChatMessage>;
  getMessagesBetweenUsers(fromId: string, toId: string): Promise<IChatMessage[]>;
  markMessageAsRead(messageId: string): Promise<IChatMessage | null>;
  getUsersWhoChattedWithVendor(vendorId: string, search?: string): Promise<{ id: string, firstName: string, role: string }[]>
  getVendorsWhoChattedWithAdmin(adminId: string, search?: string): Promise<{ id: string, firstName: string, role: string }[]>
  getVendorsWhoChattedWithUser(userId: string, search?: string): Promise<{ id: string, firstName: string, role: string }[]>
}

//wallet repo
export interface IWalletRepository {
  createWallet(data: Partial<IWallet>): Promise<IWallet | null>;
  findByUserId(userId: string): Promise<IWallet | null>;
  updateBalance(userId: string, newBalance: number): Promise<void>;
  addTransaction(userId: string, transaction: IWallet['transactions'][0]): Promise<void>;
}
