import { injectable, inject } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { CreateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

@injectable()
export class RegisterUser {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService
    ) { }

    async execute(userData: CreateUserDTO): Promise<{ userId: string; otp: string; message: string }> {
        const existingUser = await this.userRepository.findByEmail(userData.email)

        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST)
        }

        const otp = this.authService.generateOtp();

        const hashPass = await this.authService.hashPassword(userData.password)

        const tempUserId = `temp:${userData.email}`

        const newUserData = {
            ...userData,
            password: hashPass,
            role: userData.role || 'user',
            subscriptionType: userData.subscriptionType || 'basic',
            createdAt: new Date(),
            updateAt: new Date()
        };

        await this.authService.storeOtp(tempUserId, otp, 'signup');

        await this.authService.sendOtpOnEmail(userData.email, otp, 'signup');

        return {
            userId: tempUserId,
            otp: otp,
            message: 'OTP sent to email. Please verify to complete registration.',
          };
    }
}