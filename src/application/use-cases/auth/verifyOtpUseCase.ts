import { inject, injectable } from "tsyringe";
import { IConfrimRegisterUseCase, IVerifyOtpUseCase } from "../../../domain/interfaces/model/auth.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IAuthService, TOtpData } from "../../../domain/interfaces/services/authService.interface";
import { TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";


@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
    constructor(
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.ConfirmRegisterUseCase) private _registerUseCase: IConfrimRegisterUseCase,
    ) { }

    async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<{ message: string, data: TOtpData }> {
        const data = await this._authService.verifyOtp(userId, otp, purpose)
        if (!data) {
            throw new AppError(AUTH_ERROR_MESSAGES.otpError, HttpStatusCode.BAD_REQUEST)
        }

        if (purpose == 'signup') {
            const user = await this._registerUseCase.confirmRegister(data as TUserRegistrationInput)
            if (!user) {
                throw new AppError(AUTH_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
            }
        }

        return {
            message: AUTH_RES_MESSAGES.verifyOtp,
            data,
        }
    }
}