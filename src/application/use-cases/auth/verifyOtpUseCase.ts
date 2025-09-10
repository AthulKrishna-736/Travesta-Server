import { inject, injectable } from "tsyringe";
import { IConfrimRegisterUseCase, IVerifyOtpUseCase } from "../../../domain/interfaces/model/auth.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IAuthService, TOtpData } from "../../../domain/interfaces/services/authService.interface";
import { TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";


@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
    constructor(
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.ConfirmRegisterUseCase) private _registerUseCase: IConfrimRegisterUseCase,
    ) { }

    async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<{ isOtpVerified: boolean, data: TOtpData }> {
        const data = await this._authService.verifyOtp(userId, otp, purpose)
        if (!data) {
            throw new AppError('Invalid or expired Otp', HttpStatusCode.BAD_REQUEST)
        }

        if (purpose == 'signup') {
            const user = await this._registerUseCase.confirmRegister(data as TUserRegistrationInput)
            return {
                isOtpVerified: true,
                data: user,
            }
        }

        return {
            isOtpVerified: true,
            data,
        }
    }
}