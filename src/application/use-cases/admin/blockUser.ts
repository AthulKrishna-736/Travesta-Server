import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { IBlockUnblockUser } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { ResponseMapper } from "../../../utils/responseMapper";
import { ADMIN_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class BlockUnblockUser extends UserLookupBase implements IBlockUnblockUser {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository
    ) {
        super(_userRepository)
    }

    async blockUnblockUser(userId: string): Promise<{ user: TResponseUserData, message: string }> {

        const userEntity = await this.getUserEntityOrThrow(userId);

        if (userEntity.isBlocked) {
            userEntity.unblock();
        } else {
            userEntity.block();
        }

        const updatedUser = await this._userRepository.updateUser(userId, userEntity.getPersistableData());

        const mappedUser = ResponseMapper.mapUserToResponseDTO(updatedUser!);

        return {
            user: mappedUser,
            message: mappedUser.isBlocked ? `${mappedUser.role}${ADMIN_RES_MESSAGES.block}` : `${mappedUser.isBlocked}${ADMIN_RES_MESSAGES.unblock}`
        };
    }
}
