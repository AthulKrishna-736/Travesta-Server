import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { UpdateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

@injectable()
export class UpdateUser {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string, userData: UpdateUserDTO): Promise<IUser> {
        const existingUser = await this.userRepository.findById(userId)
        if (!existingUser) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        const updatedUser = await this.userRepository.updateUser(userId, userData)
        return updatedUser;
    }
}