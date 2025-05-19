import { inject, injectable } from "tsyringe";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { TOKENS } from "../../../constants/token";
import { IRedisService } from "../../../domain/services/redisService.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";
import { IGetUserUseCase } from "../../../domain/interfaces/usecases.interface";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";

@injectable()
export class GetUserProfileUseCase implements IGetUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) protected _userRepo: IUserRepository,
        @inject(TOKENS.RedisService) protected _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) protected _awsS3Service: IAwsS3Service,
    ) { }

    async getUser(userId: string): Promise<{ user: ResponseUserDTO, message: string }> {
        const user = await this._userRepo.findUserById(userId);

        if (!user) {
            throw new AppError('user not found', HttpStatusCode.NOT_FOUND)
        }

        let profileImage;
        profileImage = await this._redisService.getRedisSignedUrl(user._id as string, 'profile');

        if (!profileImage) {
            profileImage = await this._awsS3Service.getFileUrlFromAws(user.profileImage as string, awsS3Timer.expiresAt);
        }

        const mapUser: ResponseUserDTO = {
            id: user._id as string,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isGoogle: user.isGoogle,
            isBlocked: user.isBlocked,
            wishlist: user.wishlist,
            subscriptionType: user.subscriptionType,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return {
            user: mapUser,
            message: 'profile fetched successfully'
        }
    }
}
