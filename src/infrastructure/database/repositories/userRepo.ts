import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { CreateUserDTO, UpdateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { userModel } from "../models/userModels";

export class UserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<IUser | null> {
        const user = await userModel.findOne({ email }).lean();
        return user as IUser;
    }

    async getAllUsers(page: number, limit: number, role: string): Promise<{ users: IUser[]; total: number }> {
        const skip = (page - 1) * limit
        const users = await userModel.find({ role: role }).skip(skip).limit(limit).lean();
        const total = await userModel.countDocuments({ role: role });
        return { users: users, total }
    }

    async createUser(data: CreateUserDTO): Promise<IUser> {
        const user = new userModel(data);
        const saved = await user.save();
        return saved.toObject() as IUser;
    }

    async updateUser(id: string, updates: UpdateUserDTO): Promise<IUser> {
        const updated = await userModel.findByIdAndUpdate(id, updates, { new: true })
        if (!updated) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        return updated.toObject() as IUser
    }

    async findById(id: string): Promise<IUser | null> {
        const user = await userModel.findById(id)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        return user
    }

    async deleteUser(id: string): Promise<boolean> {
        const user = await userModel.findByIdAndDelete(id)
        return !!user
    }

    async updatePassword(id: string, password: string): Promise<boolean> {
        const user = await userModel.findById(id)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        user.password = password
        await user.save()
        return true
    }

    async verifyKyc(id: string): Promise<boolean> {
        const user = await userModel.findById(id)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        user.isVerified = true
        await user.save()
        return true
    }
}