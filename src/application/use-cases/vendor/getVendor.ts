import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IGetVendorUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { ResponseMapper } from "../../../utils/responseMapper";
import { VENDOR_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { AppError } from "../../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";

@injectable()
export class GetVendorProfileUseCase implements IGetVendorUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
    ) { }

    async getVendor(userId: string): Promise<{ user: TResponseUserDTO; message: string }> {

        const vendor = await this._userRepository.findUser(userId);
        if (!vendor) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (vendor.kycDocuments && vendor.kycDocuments.length > 0) {
            vendor.kycDocuments = await Promise.all(
                vendor.kycDocuments.map((key) => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            )
        }

        const mapVendor = ResponseMapper.mapUserToResponseDTO(vendor);

        return {
            user: mapVendor,
            message: VENDOR_RES_MESSAGES.profile,
        };
    }
}
