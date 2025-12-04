import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUpdateVendorReqUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { IMailService } from "../../../domain/interfaces/services/mailService.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { ADMIN_RES_MESSAGES } from "../../../constants/resMessages";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";

@injectable()
export class UpdateVendorReq implements IUpdateVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.MailService) private _mailService: IMailService,
    ) { }

    async updateVendorReq(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }> {

        const vendor = await this._userRepository.findUserById(vendorId);
        if (!vendor) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (vendor.isVerified) {
            throw new AppError('Vendor already verified', HttpStatusCode.CONFLICT);
        }

        const updateData: Record<string, any> = { verificationReason };

        if (isVerified) {
            updateData.isVerified = true;
        } else {
            updateData.isVerified = false;
            updateData.kycDocuments = [];
            await this._mailService.sendVendorRejectionEmail(vendor.email, verificationReason);
        }

        const updateVendor = await this._userRepository.updateUser(vendorId, updateData);
        if (!updateVendor) {
            throw new AppError(AUTH_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            message: `${isVerified ? ADMIN_RES_MESSAGES.approveVendor : ADMIN_RES_MESSAGES.rejectVendor}`
        };
    }
}
