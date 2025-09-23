import { IUserEntity, UserEntity } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";


export abstract class UserLookupBase {
    constructor(protected readonly _userRepository: IUserRepository) { }

    protected async getUserEntityOrThrow(userId: string): Promise<IUserEntity> {
        const userData = await this._userRepository.findUserById(userId)

        if (!userData) {
            throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
        }

        return new UserEntity(userData);
    }

    protected async getUserEntityByEmail(email: string): Promise<IUserEntity> {
        const userData = await this._userRepository.findUser(email)

        if (!userData) {
            throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
        }

        return new UserEntity(userData);
    }

    protected async getAllUserEntity(page: number, limit: number, role: string, search?: string, sortField?: string, sortOrder?: string): Promise<{ userEntities: IUserEntity[]; total: number }> {
        const { users, total } = await this._userRepository.findAllUser(page, limit, role, search, sortField, sortOrder);
        if (!users) {
            throw new AppError('Unable to fetch users', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const userEntities = users.map((user) => new UserEntity(user))
        return { userEntities, total }
    }
}