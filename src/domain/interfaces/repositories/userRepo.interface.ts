import { ClientSession } from "mongoose";
import { IUser, TUpdateUserData, TUserRegistrationInput } from "../model/user.interface";

export interface IUserRepository {
    findUserById(userId: string): Promise<IUser | null>;
    createUser(data: TUserRegistrationInput): Promise<IUser | null>;
    updateUser(userId: string, data: TUpdateUserData): Promise<IUser | null>;
    findAllUser(page: number, limit: number, role: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ users: IUser[] | null, total: number }>;
    findUser(email: string): Promise<IUser | null>
    checkUserVerified(userId: string): Promise<boolean>
    subscribeUser(userId: string, data: Pick<IUser, "subscription">, session?: ClientSession): Promise<IUser | null>
    findUserExist(userId: string): Promise<boolean>
}