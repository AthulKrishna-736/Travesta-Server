import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { CreateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import logger from "../../../utils/logger";
import { IRegisterUserUseCase } from "../../../domain/interfaces/usecases.interface";

@injectable()
export class RegisterUser implements IRegisterUserUseCase{
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService
    ) { }

    async execute(userData: CreateUserDTO): Promise<{ userId: string; message: string }> {
        const existingUser = await this.userRepository.findByEmail(userData.email)

        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST)
        }

        const otp = this.authService.generateOtp();
        logger.info(`otp created: ${otp}`);
        const hashPass = await this.authService.hashPassword(userData.password)

        const tempUserId = `temp:signup:${uuidv4()}`

        const newUserData = {
            ...userData,
            password: hashPass,
            role: userData.role || 'user',
            subscriptionType: userData.subscriptionType || 'basic',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.authService.storeOtp(tempUserId, otp, newUserData, 'signup');

        await this.authService.sendOtpOnEmail(userData.email, otp,);

        return {
            userId: tempUserId,
            message: 'OTP sent to email. Please verify to complete registration.',
        }
    }
}