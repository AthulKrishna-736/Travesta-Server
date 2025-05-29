import { IUserEntity, UserEntity } from "../../../domain/entities/user/user.entity";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export abstract class UsersListBase {
    constructor(protected readonly _userRepo: IUserRepository) { }

    protected async getAllUserEntityOrThrow(page: number, limit: number, role: string, search?: string): Promise<{ userEntities: IUserEntity[]; total: number }> {
        const { users, total } = await this._userRepo.findAllUser(page, limit, role, search);
        if (!users) {
            throw new AppError('Unable to fetch users', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const userEntities = users.map((user) => new UserEntity(user))
        return { userEntities, total }
    }

    
}