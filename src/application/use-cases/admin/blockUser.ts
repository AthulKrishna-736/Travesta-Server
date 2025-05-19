import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IUser } from "../../../domain/interfaces/user.interface";
import { IBlockUnblockUser } from "../../../domain/interfaces/usecases.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";

@injectable()
export class BlockUnblockUser implements IBlockUnblockUser {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository
    ) { }

    async blockUnblockUser(userId: string): Promise<IUser> {
        const existingUser = await this.userRepository.findUserById(userId);

        if (!existingUser) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        const newBlockState = !existingUser.isBlocked;

        const updatedUser = await this.userRepository.updateUser(userId, { isBlocked: newBlockState });

        if (!updatedUser) {
            throw new AppError('Error while block/unblock user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return updatedUser;
    }
}
