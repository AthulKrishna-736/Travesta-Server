import { inject, injectable } from "tsyringe";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { TOKENS } from "../../../constants/token";
import { IRedisService } from "../../../domain/services/redisService.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";
import { IGetUserUseCase } from "../../../domain/interfaces/usecases.interface";

@injectable()
export class GetUserProfileUseCase implements IGetUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(userId: string): Promise<void> {
        const cachedProfile = await this._redisService.get(`profile_${userId}`);

        if (cachedProfile) {
             cachedProfile;
        } else {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new AppError("User not found", HttpStatusCode.BAD_REQUEST);
            }

            const profileImage = user.profileImage || "https://example.com/default-profile-image.png";

            const signedUrl = await this._awsS3Service.getFileUrlFromAws(profileImage, 86400);

            const profileData = {
                ...user,
                profileImage: signedUrl,
            };

            await this._redisService.set(`profile_${userId}`, profileData, 86400);

             profileData;
        }
    }
}
