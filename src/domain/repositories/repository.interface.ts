import { CreateUserDTO, UpdateUserDTO } from "../../interfaces/dtos/user/user.dto";
import { IUser } from "../interfaces/user.interface";

export interface IUserRepository {
    findUserById(id: string): Promise<IUser | null>;
    createUser(data: CreateUserDTO): Promise<IUser | null>;
    updateUser(id: string, data: UpdateUserDTO): Promise<IUser | null>;
    findAllUser(page: number, limit: number, role: string, search?: string): Promise<{ users: IUser[] | null, total: number }>;
    findUser(email: string): Promise<IUser | null>
}
