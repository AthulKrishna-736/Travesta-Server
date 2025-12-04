import { inject, injectable } from "tsyringe";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { TOKENS } from "../../../constants/token";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IGetUserUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { VENDOR_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AppError } from "../../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetUserProfileUseCase implements IGetUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getUser(userId: string): Promise<{ user: TResponseUserDTO; message: string }> {
        const user = await this._userRepository.findUserById(userId);
        if (!user) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND)
        }

        if (user.profileImage) {
            user.profileImage = await this._awsS3Service.getFileUrlFromAws(user.profileImage, awsS3Timer.expiresAt);
        }

        const mappedUser = ResponseMapper.mapUserToResponseDTO(user);

        return {
            user: mappedUser,
            message: VENDOR_RES_MESSAGES.profile,
        };
    }
}
