import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IResendOtpUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";


@injectable()
export class ResendOtpUseCase implements IResendOtpUseCase {
    constructor(
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }
    async resendOtp(userId: string, purpose: "signup" | "reset"): Promise<{ message: string; }> {

        if (!userId) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        await this._authService.resendOtp(userId, purpose)
        return { message: AUTH_RES_MESSAGES.resendOtp }
    }
}