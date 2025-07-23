import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class GetAllUsers extends UserLookupBase implements IGetAllUsersUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository
    ) {
        super(userRepo);
    }

    async getAllUsers(page: number, limit: number, role: string, search: string): Promise<{ users: TResponseUserData[]; total: number }> {

        const { userEntities, total } = await this.getAllUserEntity(page, limit, role, search);

        const nonAdminUsers = userEntities.filter(user => !user.isAdmin()).map(user => user.toObject());

        const mappedUsers = nonAdminUsers.map(ResponseMapper.mapUserToResponseDTO)

        return { users: mappedUsers, total };
    }
}
