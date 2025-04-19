import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from 'uuid';
import { TOKENS } from "../../../constants/token";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IAuthService } from "../../interfaces/authService.interface";


@injectable()
export class ForgotPass {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService,
    ) { }

    async execute(email: string): Promise<{ userId: string, message: string }> {
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        const otp = this.authService.generateOtp();
        const tempUserId = `temp:reset:${uuidv4()}`;

        await this.authService.storeOtp(tempUserId, otp, { email: user.email }, 'reset');

        await this.authService.sendOtpOnEmail(user.email, otp);

        return {
            userId: tempUserId,
            message: 'Otp sent successfully'
        }
    }
}