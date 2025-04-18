import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { IAuthService } from "../../interfaces/authService.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


@injectable()
export class VerifyOtpAndRegister {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authServices: IAuthService
    ) { }

    async execute(tempUserId: string, otp: string): Promise<IUser> {
        const userData = await this.authServices.verifyOtp(tempUserId, otp, 'signup');

        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.userRepository.createUser(userData)
        return user;
    }
}