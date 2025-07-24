import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { IBlockUnblockUser } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class BlockUnblockUser extends UserLookupBase implements IBlockUnblockUser {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository
    ) {
        super(userRepo)
    }

    async blockUnblockUser(userId: string): Promise<TResponseUserData> {

        const userEntity = await this.getUserEntityOrThrow(userId);

        if (userEntity.isBlocked) {
            userEntity.unblock();
        } else {
            userEntity.block();
        }

        const updatedUser = await this._userRepo.updateUser(userId, userEntity.getPersistableData());

        const mappedUser = ResponseMapper.mapUserToResponseDTO(updatedUser!);

        return mappedUser;
    }
}
