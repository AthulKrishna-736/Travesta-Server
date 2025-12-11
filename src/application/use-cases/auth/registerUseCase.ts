import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TOKENS } from "../../../constants/token";
import { v4 as uuidv4 } from 'uuid';
import { TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IRegisterUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";


@injectable()
export class RegisterUseCase implements IRegisterUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }

    async register(userData: TUserRegistrationInput): Promise<{ userId: string; message: string; }> {
        const existingUser = await this._userRepository.findUser(userData.email as string)

        if (existingUser) {
            throw new AppError(AUTH_ERROR_MESSAGES.userExist, HttpStatusCode.BAD_REQUEST)
        }

        const otp = this._authService.generateOtp();
        const hashPass = await this._authService.hashPassword(userData.password as string)
        const tempUserId = `temp:signup:${uuidv4()}`

        const newUserData: TUserRegistrationInput = {
            ...userData,
            password: hashPass,
            role: userData.role || 'user',
        };

        await Promise.all([
            this._authService.storeOtp(tempUserId, otp, newUserData, 'signup'),
            this._authService.sendOtpOnEmail(userData.email as string, otp,)
        ])

        return {
            userId: tempUserId,
            message: AUTH_RES_MESSAGES.otp,
        }
    }
}