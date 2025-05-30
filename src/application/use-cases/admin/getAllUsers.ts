import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IUser, TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { UsersListBase } from "../base/usersList.base";
import { IUserEntity } from "../../../domain/entities/user.entity";

@injectable()
export class GetAllUsers extends UsersListBase implements IGetAllUsersUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository
    ) {
        super(userRepo);
    }

    async getAllUsers(page: number, limit: number, role: string, search: string): Promise<{ users: TResponseUserData[]; total: number }> {

        const { userEntities, total } = await this.getAllUserEntityOrThrow(page, limit, role, search);

        const nonAdminUsers = userEntities.filter(user => !user.isAdmin()).map(user => user.toObject());

        return { users: nonAdminUsers, total };
    }


}
