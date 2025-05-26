import { inject, injectable } from "tsyringe";
import { IGetAllVendorReqUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { UsersListBase } from "../base/usersList.base";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IVendor } from "../../../domain/interfaces/model/vendor.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";

@injectable()
export class GetAllVendorReq extends UsersListBase implements IGetAllVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepo: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) {
        super(userRepo);
    }

    async getAllVendorReq(page: number, limit: number, search?: string): Promise<{ vendors: IVendor[]; total: number }> {
        const { userEntities, total } = await this.getAllUserEntityOrThrow(page, limit, 'vendor', search);

        const vendors = await Promise.all(
            userEntities.map(async (vendorEntity) => {
                const vendorObject = vendorEntity.toObject();
                const kycDocs = vendorObject.kycDocuments || [];

                const signedUrls = kycDocs.length > 0
                    ? await this.getSignedUrlsWithRedisCache(vendorObject._id!, kycDocs)
                    : [];

                return {
                    ...vendorObject,
                    kycDocuments: signedUrls,
                };
            })
        );

        return { vendors, total };
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
