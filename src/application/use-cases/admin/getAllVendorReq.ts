import { inject, injectable } from "tsyringe";
import { IGetAllVendorReqUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../utils/responseMapper";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetAllVendorReq implements IGetAllVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getAllVendorReq(page: number, limit: number, search?: string, sortField?: string, sortOrder?: string): Promise<{ vendors: TResponseUserDTO[]; total: number }> {
        const { users, total } = await this._userRepository.findAllUser(page, limit, 'vendor', search, sortField, sortOrder);
        if (!users || users.length == 0) {
            throw new AppError('No Vendors Found', HttpStatusCode.NOT_FOUND);
        }

        const signedKycDocs = await Promise.all(
            users.map(async (u) => {
                if (u.kycDocuments && u.kycDocuments.length > 0) {
                    u.kycDocuments = await Promise.all(
                        u.kycDocuments.map((key) => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
                    )
                }

                return u;
            }))

        const mappedVendors = signedKycDocs.map(ResponseMapper.mapUserToResponseDTO);

        return {
            vendors: mappedVendors,
            total
        };
    }
}
