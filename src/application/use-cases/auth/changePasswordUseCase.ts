import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { AppError } from "../../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";
import { IChangePasswordUseCase } from "../../../domain/interfaces/model/auth.interface";


@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ user: TResponseUserDTO, message: string }> {
        const user = await this._userRepository.findUserById(userId);
        if (!user || !user._id) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const comparePass = await this._authService.comparePassword(oldPassword.trim(), user.password);
        if (!comparePass) {
            throw new AppError('Old password does not match', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        if (oldPassword.trim() === newPassword.trim()) {
            throw new AppError(AUTH_ERROR_MESSAGES.passError, HttpStatusCode.BAD_REQUEST);
        }

        const hashPass = await this._authService.hashPassword(newPassword.trim());

        const update = await this._userRepository.updateUser(user._id, { password: hashPass });
        if (!update) {
            throw new AppError('Error while updating password', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedUser = ResponseMapper.mapUserToResponseDTO(update);

        return {
            user: mappedUser,
            message: 'Password updated successfully',
        }

    }
}