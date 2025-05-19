import { inject, injectable } from "tsyringe";
import { GetUserProfileUseCase } from "../user/getUser";
import { IUserRepository } from "../../../domain/repositories/repository.interface";
import { IRedisService } from "../../../domain/services/redisService.interface";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IGetVendorUseCase } from "../../../domain/interfaces/usecases.interface";
import { TOKENS } from "../../../constants/token";

@injectable()
export class GetVendorProfileUseCase extends GetUserProfileUseCase implements IGetVendorUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepo: IUserRepository,
        @inject(TOKENS.RedisService) _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) _awsS3Service: IAwsS3Service,
    ) {
        super(_userRepo, _redisService, _awsS3Service);
    }

    async getUser(userId: string): Promise<{ user: ResponseUserDTO; message: string; }> {
        const vendor = await this._userRepo.findUserById(userId);

        if (!vendor) {
            throw new AppError('user not found', HttpStatusCode.NOT_FOUND)
        }

        let profileImage;
        let kycDocuments;
        profileImage = await this._redisService.getRedisSignedUrl(vendor._id as string, 'profile');
        kycDocuments = await this._redisService.getRedisSignedUrl(vendor._id as string, 'kycDocs');

        if (!profileImage && vendor.profileImage) {
            profileImage = await this._awsS3Service.getFileUrlFromAws(vendor.profileImage as string, awsS3Timer.expiresAt);
        }

        if (!kycDocuments && vendor.kycDocuments && vendor.kycDocuments.length > 0) {
            kycDocuments = await Promise.all(
                vendor.kycDocuments.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            )
        }

        const mapVendor: ResponseUserDTO = {
            id: vendor._id as string,
            firstName: vendor.firstName,
            lastName: vendor.lastName,
            email: vendor.email,
            phone: vendor.phone,
            isGoogle: vendor.isGoogle,
            isBlocked: vendor.isBlocked,
            profileImage: profileImage as string,
            kycDocuments: kycDocuments as string[],
            wishlist: vendor.wishlist,
            subscriptionType: vendor.subscriptionType,
            role: vendor.role,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
        };

        return {
            user: mapVendor,
            message: 'profile fetched successfully'
        }
    }
}