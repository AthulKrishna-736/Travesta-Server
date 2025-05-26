import { IUserEntity, UserEntity } from "../../../domain/entities/user/user.entity";
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
}