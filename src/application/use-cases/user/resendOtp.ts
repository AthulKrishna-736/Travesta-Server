import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IAuthService } from "../../interfaces/authService.interface";
import { IResendOtpUseCase } from "../../../domain/interfaces/usecases.interface";


@injectable()
export class ResendOtp implements IResendOtpUseCase{
    constructor(
        @inject(TOKENS.AuthService) private authSerivce: IAuthService
    ) { }

    async execute(userId: string): Promise<{ message: string }> {
        await this.authSerivce.resendOtp(userId, 'signup')
        return { message: 'OTP resent to you email' }
    }
}