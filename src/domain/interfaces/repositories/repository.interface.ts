import { TWalletDocument } from "../../../infrastructure/database/models/walletModel";
import { TSubscription } from "../../../shared/types/client.types";
import { IAmenities, TCreateAmenityData, TUpdateAmenityData } from "../model/amenities.interface";
import { IBooking } from "../model/booking.interface";
import { IChatMessage, TCreateChatMessage } from "../model/chat.interface";
import { IHotel, TCreateHotelData, TUpdateHotelData } from "../model/hotel.interface";
import { IRoom, TCreateRoomData, TUpdateRoomData } from "../model/room.interface";
import { ISubscription, TCreateSubscriptionData, TUpdateSubscriptionData } from "../model/subscription.interface";
import { IUser, TUpdateUserData, TUserRegistrationInput } from "../model/user.interface";
import { IWallet, TCreateWalletData, TCreateWalletTransaction } from "../model/wallet.interface";

//user repo
export interface IUserRepository {
  findUserById(userId: string): Promise<IUser | null>;
  createUser(data: TUserRegistrationInput): Promise<IUser | null>;
  updateUser(userId: string, data: TUpdateUserData): Promise<IUser | null>;
  findAllUser(page: number, limit: number, role: string, search?: string): Promise<{ users: IUser[] | null, total: number }>;
  findUser(email: string): Promise<IUser | null>
  checkUserVerified(userId: string): Promise<boolean>
  subscribeUser(userId: string, data: Pick<IUser, 'subscription'>): Promise<IUser | null>
}

//hotel repo
export interface IHotelRepository {
  createHotel(data: TCreateHotelData): Promise<IHotel | null>;
  findHotelById(hotelId: string): Promise<IHotel | null>;
  updateHotel(hotelId: string, data: TUpdateHotelData): Promise<IHotel | null>;
  findHotelsByVendor(vendorId: string): Promise<IHotel[] | null>;
  findAllHotels(page: number, limit: number, search?: string): Promise<{ hotels: IHotel[] | null; total: number }>;
}

//room repo
export interface IRoomRepository {
  createRoom(data: TCreateRoomData): Promise<IRoom | null>;
  findRoomById(roomId: string): Promise<IRoom | null>;
  updateRoom(roomId: string, data: TUpdateRoomData): Promise<IRoom | null>;
  deleteRoom(roomId: string): Promise<boolean>;
  findRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
  findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
  findAllRooms(page: number, limit: number, search?: string): Promise<{ rooms: IRoom[], total: number }>;
  findFilteredAvailableRooms(
    page: number,
    limit: number,
    minPrice?: number,
    maxPrice?: number,
    amenities?: string[],
    search?: string,
    destination?: string,
    checkIn?: string,
    checkOut?: string,
    guests?: string
  ): Promise<{ rooms: IRoom[]; total: number }>;
}

//booking repo
export interface IBookingRepository {
  createBooking(data: Partial<IBooking>): Promise<IBooking | null>;
  findBookingsByUser(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
  findBookingsByHotel(hotelId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>
  isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
  findByid(bookingId: string): Promise<IBooking | null>;
  save(booking: IBooking): Promise<void>;
  confirmBookingPayment(bookingId: string): Promise<void>;
  findBookingsByVendor(vendorId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
}

//amenities repo
export interface IAmenitiesRepository {
  createAmenity(data: TCreateAmenityData): Promise<IAmenities | null>
  findAmenityById(amenityId: string): Promise<IAmenities | null>
  updateAmenity(amenityId: string, data: TUpdateAmenityData): Promise<IAmenities | null>
  findAllAmenities(page: number, limit: number, search?: string, sortField?: string, sortOrder?: string): Promise<{ amenities: IAmenities[] | null, total: number }>
  getQuery(filter: any): Promise<{ amenities: IAmenities[] | null, total: number }>
  findUsedActiveAmenities(): Promise<IAmenities[] | null>
}


//subscription repo
export interface ISubscriptionRepository {
  createPlan(data: TCreateSubscriptionData): Promise<ISubscription | null>
  updatePlan(planId: string, data: TUpdateSubscriptionData): Promise<ISubscription | null>
  findPlanById(planId: string): Promise<ISubscription | null>
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
  createWallet(data: TCreateWalletData): Promise<IWallet | null>;
  findUserWallet(userId: string, page: number, limit: number): Promise<{ wallet: IWallet | null, total: number }>;
  updateBalance(userId: string, newBalance: number): Promise<void>;
  addTransaction(userId: string, transaction: TCreateWalletTransaction): Promise<boolean>;
  findWalletExist(userId: string): Promise<boolean>;
  findWallet(userId: string): Promise<TWalletDocument | null>
  transferAmountBetweenUsers(senderId: string, receiverId: string, amount: number, transactionId: string, relatedBookingId: string, description: string): Promise<boolean>;
}
