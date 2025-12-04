import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IBlockUnblockUser } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { ResponseMapper } from "../../../utils/responseMapper";
import { ADMIN_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { AppError } from "../../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class BlockUnblockUser implements IBlockUnblockUser {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
    ) { }

    async blockUnblockUser(userId: string): Promise<{ user: TResponseUserDTO, message: string }> {
        const user = await this._userRepository.findUserById(userId);
        if (!user) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const toggleStatus = { isBlocked: !user.isBlocked };

        const updatedUser = await this._userRepository.updateUser(userId, toggleStatus);
        if (!updatedUser) {
            throw new AppError(AUTH_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedUser = ResponseMapper.mapUserToResponseDTO(updatedUser);

        return {
            user: mappedUser,
            message: mappedUser.isBlocked ? `${mappedUser.role}${ADMIN_RES_MESSAGES.block}` : `${mappedUser.isBlocked}${ADMIN_RES_MESSAGES.unblock}`
        };
    }
}
