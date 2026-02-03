import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { ILoginUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { TRole } from "../../../shared/types/common.types";
import { awsS3Timer, jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";


@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string; refreshToken: string; user: TResponseUserDTO }> {
        const user = await this._userRepository.findUser(email);
        if (!user || !user._id) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (user.role !== expectedRole) {
            throw new AppError(AUTH_ERROR_MESSAGES.invalidRole, HttpStatusCode.UNAUTHORIZED);
        }

        if (user.isBlocked) {
            throw new AppError(AUTH_ERROR_MESSAGES.blocked, HttpStatusCode.UNAUTHORIZED);
        }

        const isValidPass = await this._authService.comparePassword(password, user.password);
        if (!isValidPass) {
            throw new AppError(AUTH_ERROR_MESSAGES.invalidData, HttpStatusCode.BAD_REQUEST);
        }

        const accessToken = this._authService.generateAccessToken(user._id, user.role, user.email);
        const refreshToken = this._authService.generateRefreshToken(user._id, user.role, user.email);

        if(user.profileImage){
            user.profileImage = await this._awsS3Service.getFileUrlFromAws(user.profileImage, awsS3Timer.expiresAt);
        }

        if(user.kycDocuments && user.kycDocuments.length > 0){
            user.kycDocuments = await Promise.all(
                user.kycDocuments.map((key)=> this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            )
        }

        await this._redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000);

        const mappedUser = ResponseMapper.mapUserToResponseDTO(user)

        return {
            accessToken,
            refreshToken,
            user: mappedUser
        };
    }

}
