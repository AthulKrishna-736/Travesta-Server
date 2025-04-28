import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { IUpdatePasswordUseCase } from "../../../domain/interfaces/usecases.interface";

@injectable()
export class UpdatePassword implements IUpdatePasswordUseCase{
    constructor(
        @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private authService: IAuthService
    ) { }

    async execute(email: string, password: string): Promise<void> {
        if (!email) {
            throw new AppError('Email is missing', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.userRepository.findByEmail(email);

        if (!user || !user._id) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }

        const isMatch = await this.authService.comparePassword(password, user.password)

        if (isMatch) {
            throw new AppError('New password must be different from the old password.', HttpStatusCode.CONFLICT);
        }

        const hashPass = await this.authService.hashPassword(password)
        await this.userRepository.updatePassword(user._id, hashPass)
    }
}