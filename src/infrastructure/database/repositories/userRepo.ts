import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IUser, TUpdateUserData, TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { TUserDocument, userModel } from "../models/userModels";
import { BaseRepository } from "./baseRepo";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository extends BaseRepository<TUserDocument> implements IUserRepository {
    constructor() {
        super(userModel)
    }

    async findUserById(id: string): Promise<IUser | null> {
        const user = await this.findById(id);
        return user;
    }

    async createUser(data: TUserRegistrationInput): Promise<IUser | null> {
        const user = await this.create(data);
        return user;
    }

    async updateUser(id: string, data: TUpdateUserData): Promise<IUser | null> {
        const user = await this.update(id, data);
        return user;
    }

    async findUser(email: string): Promise<IUser | null> {
        const user = await this.findOne({ email }).exec();
        return user;
    }

    async findAllUser(page: number, limit: number, role: string, search?: string): Promise<{ users: IUser[] | null, total: number }> {
        const skip = (page - 1) * limit;
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
        const user = await result.skip(skip).limit(limit).lean<IUser[]>();

        return { users: user, total }
    }

    async subscribeUser(id: string, data: Pick<IUser, "subscription">): Promise<IUser | null> {
        const user = await this.update(id, data);
        return user;
    }
}