import { inject, injectable } from "tsyringe";
import { IGetAllVendorReqUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { IUserEntity } from "../../../domain/entities/user.entity";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class GetAllVendorReq extends UserLookupBase implements IGetAllVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(_userRepository);
    }

    async getAllVendorReq(page: number, limit: number, search?: string, sortField?: string, sortOrder?: string): Promise<{ vendors: TResponseUserData[]; total: number }> {
        const { userEntities, total } = await this.getAllUserEntity(page, limit, 'vendor', search, sortField, sortOrder);

        const vendors = await Promise.all(
            userEntities.map(async (vendorEntity: IUserEntity) => {

                const kycDocs = vendorEntity.kycDocuments || [];

                const signedUrls = kycDocs.length > 0
                    ? await this.getSignedUrlsWithRedisCache(vendorEntity.id as string, kycDocs)
                    : [];

                if (signedUrls) {
                    vendorEntity.updateProfile({ kycDocuments: signedUrls })
                }

                return vendorEntity.toObject();
            })
        );

        const mappedVendors = vendors.map(ResponseMapper.mapUserToResponseDTO);

        return { vendors: mappedVendors, total };
    }

    private async getSignedUrlsWithRedisCache(userId: string, kycDocs: string[]): Promise<string[]> {
        const cached = await this._redisService.getRedisSignedUrl(userId, 'kycDocs');

        if (cached && Array.isArray(cached)) {
            return cached as string[];
        }

        const signedUrls = await Promise.all(
            kycDocs.map((doc) => this._awsS3Service.getFileUrlFromAws(doc, awsS3Timer.expiresAt))
        );

        await this._redisService.storeKycDocs(userId, signedUrls, awsS3Timer.expiresAt);
        return signedUrls;
    }
}
