import { inject, injectable } from "tsyringe";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { TOKENS } from "../../../constants/token";
import { IOtpService } from "../../../domain/services/redisService.interface";
import { IJwtService } from "../../../domain/services/redisService.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";

@injectable()
export class GetUserProfileUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.RedisService) private _redisService: IOtpService & IJwtService,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async execute(userId: string) {
        const cachedProfile = await this._redisService.get(`profile_${userId}`);

        if (cachedProfile) {
            return cachedProfile;
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

            return profileData;
        }
    }
}
