import { inject, injectable } from "tsyringe";
import { IGetAllVendorReqUseCase } from "../../../domain/interfaces/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


@injectable()
export class GetAllVendorReq implements IGetAllVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private readonly _awsS3Service: IAwsS3Service,
    ) { }

    async getAllVendorReq(page: number, limit: number, search?: string): Promise<{ vendors: ResponseUserDTO[]; total: number; }> {
        const { users, total } = await this._userRepository.findAllUser(page, limit, 'vendor', search)

        if (!users) {
            throw new AppError('cant fetch vendors try again later', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedVendors: ResponseUserDTO[] = await Promise.all(users.map(async (vendor) => {
            let kycDocuments: string[] = vendor.kycDocuments || [];

            if (kycDocuments.length > 0) {
                const signedUrls = await Promise.all(
                    kycDocuments.map((doc) => this._awsS3Service.getFileUrlFromAws(doc, 86400))
                );
                kycDocuments = signedUrls;
            }
            return {
                id: vendor._id!,
                firstName: vendor.firstName,
                lastName: vendor.lastName,
                email: vendor.email,
                isGoogle: vendor.isGoogle ?? false,
                phone: vendor.phone,
                isBlocked: vendor.isBlocked,
                wishlist: vendor.wishlist,
                isVerified: vendor.isVerified,
                role: vendor.role,
                kycDocuments: kycDocuments,
                verificationReason: vendor.verificationReason || 'Pending',
                subscriptionType: vendor.subscriptionType,
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
            };
        }));

        console.log('Mapped vendors with signed URLs: ', mappedVendors);

        return { vendors: mappedVendors, total };
    }
}