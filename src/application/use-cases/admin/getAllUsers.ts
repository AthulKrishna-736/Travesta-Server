import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";

@injectable()
export class GetAllUsers extends UserLookupBase implements IGetAllUsersUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository
    ) {
        super(_userRepository);
    }

    async getAllUsers(page: number, limit: number, role: string, search: string, sortField?: string, sortOrder?: string): Promise<{ users: TResponseUserDTO[]; total: number }> {

        const { userEntities, total } = await this.getAllUserEntity(page, limit, role, search, sortField, sortOrder);

        const nonAdminUsers = userEntities.filter(user => !user.isAdmin()).map(user => user.toObject());

        const mappedUsers = nonAdminUsers.map(ResponseMapper.mapUserToResponseDTO)

        return { users: mappedUsers, total };
    }
}
