import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetAllUsers implements IGetAllUsersUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
    ) { }

    async getAllUsers(page: number, limit: number, role: string, search: string, sortField?: string, sortOrder?: string): Promise<{ users: TResponseUserDTO[]; total: number }> {
        const { users, total } = await this._userRepository.findAllUser(page, limit, role, search, sortField, sortOrder)
        if (!users) {
            throw new AppError('No users found', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedUsers = users.map(ResponseMapper.mapUserToResponseDTO)

        return { users: mappedUsers, total };
    }
}
