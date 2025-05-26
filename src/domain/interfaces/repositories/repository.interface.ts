import { IHotel, IRoom } from "../model/hotel.interface";
import { IUser } from "../model/user.interface";

export interface IUserRepository {
    findUserById(id: string): Promise<IUser | null>;
    createUser(data: CreateUserDTO): Promise<IUser | null>;
    updateUser(id: string, data: UpdateUserDTO): Promise<IUser | null>;
    findAllUser(page: number, limit: number, role: string, search?: string): Promise<{ users: IUser[] | null, total: number }>;
    findUser(email: string): Promise<IUser | null>
}

//hotel repo
export interface IHotelRepository {
    createHotel(data: CreateHotelDTO): Promise<IHotel | null>;
    findHotelById(id: string): Promise<IHotel | null>;
    updateHotel(id: string, data: UpdateHotelDTO): Promise<IHotel | null>;
    findHotelsByVendor(vendorId: string): Promise<IHotel[] | null>;
    findAllHotels(page: number, limit: number, search?: string): Promise<{ hotels: IHotel[] | null; total: number }>;
}


export interface IRoomRepository {
  createRoom(data: CreateRoomDTO): Promise<IRoom | null>;
  findRoomById(id: string): Promise<IRoom | null>;
  updateRoom(id: string, data: UpdateRoomDTO): Promise<IRoom | null>;
  deleteRoom(id: string): Promise<boolean>;
  findRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
  findAvailableRoomsByHotel(hotelId: string): Promise<IRoom[] | null>;
}
