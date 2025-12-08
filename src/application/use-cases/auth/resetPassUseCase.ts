import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { IResetPassUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";


@injectable()
export class ResetPassUseCase implements IResetPassUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }

    async resetPass(email: string, password: string): Promise<void> {
        if (!email) {
            throw new AppError(AUTH_ERROR_MESSAGES.emailError, HttpStatusCode.BAD_REQUEST);
        }

        const user = await this._userRepository.findUser(email);

        if (!user || !user._id) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND)
        }

        const isMatch = await this._authService.comparePassword(password, user.password)

        if (isMatch) {
            throw new AppError(AUTH_ERROR_MESSAGES.passError, HttpStatusCode.CONFLICT);
        }

        const hashPass = await this._authService.hashPassword(password)
        await this._userRepository.updateUser(user._id, { password: hashPass })
    }
}