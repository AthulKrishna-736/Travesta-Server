import { IBooking, IHotel, IRoom, TCreateHotelData, TCreateRoomData, TUpdateHotelData, TUpdateRoomData } from "../model/hotel.interface";
import { IUser, TUpdateUserData, TUserRegistrationInput } from "../model/user.interface";

export interface IUserRepository {
  findUserById(id: string): Promise<IUser | null>;
  createUser(data: TUserRegistrationInput): Promise<IUser | null>;
  updateUser(id: string, data: TUpdateUserData): Promise<IUser | null>;
  findAllUser(page: number, limit: number, role: string, search?: string): Promise<{ users: IUser[] | null, total: number }>;
  findUser(email: string): Promise<IUser | null>
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
  findAllRooms(page: number, limit: number, search?: string): Promise<{rooms:IRoom[], total: number}>;
}

export interface IBookingRepository {
  createBooking(data: Partial<IBooking>): Promise<IBooking | null>;
  findBookingsByUser(userId: string): Promise<IBooking[]>;
  findBookingsByHotel(hotelId: string): Promise<IBooking[]>;
  isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
  findByid(id: string): Promise<IBooking | null>;
  save(booking: IBooking): Promise<void>;
}