import { IUserEntity, UserEntity } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export abstract class UserLookupBase {
    constructor(protected readonly _userRepo: IUserRepository) { }

    protected async getUserEntityOrThrow(userId: string): Promise<IUserEntity> {
        const userData = await this._userRepo.findUserById(userId)

        if (!userData) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        return new UserEntity(userData);
    }

    protected async getUserEntityByEmail(email: string): Promise<IUserEntity> {
        const userData = await this._userRepo.findUser(email)

        if (!userData) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        return new UserEntity(userData);
    }

    protected async getAllUserEntity(page: number, limit: number, role: string, search?: string): Promise<{ userEntities: IUserEntity[]; total: number }> {
        const { users, total } = await this._userRepo.findAllUser(page, limit, role, search);
        if (!users) {
            throw new AppError('Unable to fetch users', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const userEntities = users.map((user) => new UserEntity(user))
        return { userEntities, total }
    }
}