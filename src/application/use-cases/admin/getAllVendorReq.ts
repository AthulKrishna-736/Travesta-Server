import { inject, injectable } from "tsyringe";
import { IGetAllVendorReqUseCase } from "../../../domain/interfaces/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { TOKENS } from "../../../constants/token";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";


@injectable()
export class GetAllVendorReq implements IGetAllVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(page: number, limit: number, search?: string): Promise<{ vendors: ResponseUserDTO[]; total: number; }> {
        const { users, total } = await this.userRepository.getAllUsers(page, limit, 'vendor', search)

        const mappedVendors: ResponseUserDTO[] = users.map((vendor) => {
            return {
                id: vendor._id!?.toString(),
                firstName: vendor.firstName,
                lastName: vendor.lastName,
                email: vendor.email,
                isGoogle: vendor.isGoogle ?? false,
                phone: vendor.phone,
                isBlocked: vendor.isBlocked,
                wishlist: vendor.wishlist,
                isVerified: vendor.isVerified,
                role: vendor.role,
                kycDocuments: vendor.kycDocuments || [],
                verificationReason: vendor.verificationReason || 'Pending',
                subscriptionType: vendor.subscriptionType,
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
            }
        })
        console.log('map vendors: ', mappedVendors)

        return { vendors: mappedVendors, total }
    }
}