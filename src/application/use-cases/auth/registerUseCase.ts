import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { v4 as uuidv4 } from 'uuid';
import { TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IRegisterUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import logger from "../../../utils/logger";


@injectable()
export class RegisterUseCase implements IRegisterUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }

    async register(userData: TUserRegistrationInput): Promise<{ userId: string; message: string; }> {
        const existingUser = await this._userRepo.findUser(userData.email as string)

        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST)
        }

        const otp = this._authService.generateOtp();
        logger.info(`otp created: ${otp}`);
        const hashPass = await this._authService.hashPassword(userData.password as string)

        const tempUserId = `temp:signup:${uuidv4()}`

        const newUserData = {
            ...userData,
            password: hashPass,
            role: userData.role || 'user',
            subscription: 'basic',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this._authService.storeOtp(tempUserId, otp, newUserData, 'signup');

        await this._authService.sendOtpOnEmail(userData.email as string, otp,);

        return {
            userId: tempUserId,
            message: 'OTP sent to email. Please verify to complete registration.',
        }
    }
}