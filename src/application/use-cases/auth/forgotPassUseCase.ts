import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { v4 as uuidv4 } from 'uuid';
import { IForgotPassUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { TRole } from "../../../shared/types/client.types";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class ForgotPassUseCase implements IForgotPassUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }
  
    async forgotPass(email: string, role: TRole): Promise<{ userId: string; message: string; }> {
        const user = await this._userRepository.findUser(email)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        if (user.role !== role) {
            throw new AppError('Unauthorized: Invalid role for the reset password', HttpStatusCode.UNAUTHORIZED)
        }

        const otp = this._authService.generateOtp();
        console.log('password generate forgot: ', otp)
        const tempUserId = `temp:reset:${uuidv4()}`;

        await this._authService.storeOtp(tempUserId, otp, { email: user.email }, 'reset');

        await this._authService.sendOtpOnEmail(user.email, otp);

        return {
            userId: tempUserId,
            message: AUTH_RES_MESSAGES.forgotPass,
        }
    }
}