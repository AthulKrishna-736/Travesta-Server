import { inject, injectable } from "tsyringe";
import { GetUserProfileUseCase } from "../user/getUser";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IGetVendorUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { ResponseMapper } from "../../../utils/responseMapper";
import { VENDOR_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";

@injectable()
export class GetVendorProfileUseCase extends GetUserProfileUseCase implements IGetVendorUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository,
        @inject(TOKENS.RedisService) _redisService: IRedisService,
        @inject(TOKENS.AwsS3Service) _awsS3Service: IAwsS3Service,
    ) {
        super(_userRepository, _redisService, _awsS3Service);
    }

    async getVendor(userId: string): Promise<{ user: TResponseUserDTO; message: string }> {

        const vendorEntity = await this._getBaseUserEntityWithProfile(userId);

        let kycDocumentsSignedUrls;
        kycDocumentsSignedUrls = await this._redisService.getRedisSignedUrl(vendorEntity.id as string, 'kycDocs');
        if ((!kycDocumentsSignedUrls || kycDocumentsSignedUrls.length === 0) && vendorEntity.kycDocuments?.length) {
            kycDocumentsSignedUrls = await Promise.all(
                vendorEntity.kycDocuments.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );
            await this._redisService.storeKycDocs(vendorEntity.id as string, kycDocumentsSignedUrls, awsS3Timer.expiresAt);
        }

        vendorEntity.updateProfile({
            kycDocuments: kycDocumentsSignedUrls as string[],
        });

        const mapVendor = ResponseMapper.mapUserToResponseDTO(vendorEntity.toObject());

        return {
            user: mapVendor,
            message: VENDOR_RES_MESSAGES.profile,
        };
    }

}
