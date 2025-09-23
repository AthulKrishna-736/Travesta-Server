import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IUser, TUpdateUserData, TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { TUserDocument, userModel } from "../models/userModels";
import { BaseRepository } from "./baseRepo";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository extends BaseRepository<TUserDocument> implements IUserRepository {
    constructor() {
        super(userModel)
    }

    async findUserById(userId: string): Promise<IUser | null> {
        const user = await this.findById(userId);
        return user;
    }

    async createUser(data: TUserRegistrationInput): Promise<IUser | null> {
        const user = await this.create(data);
        return user;
    }

    async updateUser(userId: string, data: TUpdateUserData): Promise<IUser | null> {
        const user = await this.update(userId, data);
        return user;
    }

    async findUser(email: string): Promise<IUser | null> {
        const user = await this.findOne({ email }).exec();
        return user;
    }

    async findAllUser(page: number, limit: number, role: string, search?: string, sortField: string = 'firstName', sortOrder: string = 'ascending'): Promise<{ users: IUser[] | null, total: number }> {
        const skip = (page - 1) * limit;
        const sortDirection = sortOrder == 'descending' ? -1 : 1;
        const filter: any = {
            role
        }
        if (search) {
            const searchRegex = new RegExp('^' + search, 'i')
            filter.$or = [
                { firstName: searchRegex },
                { email: searchRegex },
            ]
        }

        const result = this.find(filter);
        const total = await this.model.countDocuments(filter);
        const user = await result.skip(skip).limit(limit).sort({ [sortField]: sortDirection }).lean<IUser[]>();

        return { users: user, total }
    }

    async subscribeUser(userId: string, data: Pick<IUser, "subscription">): Promise<IUser | null> {
        const user = await this.update(userId, data);
        return user;
    }

    async checkUserVerified(userId: string): Promise<boolean> {
        const user = await this.findOne({ userId, isVerified: true }).lean<IUser>();
        return user ? true : false;
    }

    async findUserExist(userId: string): Promise<boolean> {
        const user = await this.findById(userId);
        return user ? true : false;
    }
}