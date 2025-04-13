import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IAuthService } from "../../interfaces/authService.interface";


export class UpdatePassword {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthService
    ) { }

    async execute(userId: string, password: string): Promise<void> {
        const existingUser = await this.userRepository.findById(userId)
        if (!existingUser) {
            throw new AppError('User does not exists!', HttpStatusCode.BAD_REQUEST);
        }

        const isMatch = await this.authService.comparePassword(existingUser.password, password)

        if (isMatch) {
            throw new AppError('New password cannot be old password', HttpStatusCode.BAD_REQUEST);
        }

        const hashPass = await this.authService.hashPassword(password)
        await this.userRepository.updatePassword(userId, hashPass)
    }
}