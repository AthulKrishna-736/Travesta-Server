import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { IAuthService } from "../interfaces/authService.interface";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { VerifyAndRegister } from "./user/verifyAndRegister";


@injectable()
export class VerifyOtp {
    constructor(
        @inject(TOKENS.AuthService) private authService: IAuthService,
        @inject(VerifyAndRegister) private verifyAndRegister: VerifyAndRegister
    ) { }

    async execute(userId: string, otp: string, purpose: 'signup' | 'reset'): Promise<{ isOtpVerified: boolean, data: any }> {

        const data = await this.authService.verifyOtp(userId, otp, purpose)
        if (!data) {
            throw new AppError('Invalid or expired Otp', HttpStatusCode.BAD_REQUEST)
        }

        if (purpose == 'signup') {
            const user = await this.verifyAndRegister.execute(data)
            return {
                isOtpVerified: true,
                data: user,
            }
        }
        console.log(`[VERIFY_OTP] OTP verified for user ${userId} with purpose ${purpose}`);

        return {
            isOtpVerified: true,
            data,
        }
    }
}