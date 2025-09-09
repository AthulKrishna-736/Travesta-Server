import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUpdateVendorReqUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import logger from "../../../utils/logger";
import { IMailService } from "../../../domain/interfaces/services/mailService.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { ADMIN_RES_MESSAGES } from "../../../constants/resMessages";

@injectable()
export class UpdateVendorReq extends UserLookupBase implements IUpdateVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) userRepository: IUserRepository,
        @inject(TOKENS.MailService) private _mailService: IMailService,
    ) {
        super(userRepository);
    }

    async updateVendorReq(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }> {
        const vendorEntity = await this.getUserEntityOrThrow(vendorId);

        if (vendorEntity.isVerified && isVerified) {
            throw new AppError('Vendor already verified', HttpStatusCode.CONFLICT);
        }

        if (isVerified) {
            vendorEntity.verify();
        } else {
            vendorEntity.unVerify();
            vendorEntity.updateProfile({ kycDocuments: [] });

            await this._mailService.sendVendorRejectionEmail(vendorEntity.email, verificationReason);
        }

        const updatedData = {
            ...vendorEntity.getPersistableData(),
            verificationReason
        };

        await this._userRepository.updateUser(vendorId, updatedData);

        logger.info(`Vendor ${isVerified ? 'approved' : 'rejected'} for ${vendorEntity.email}`);

        return {
            message: `${isVerified ? ADMIN_RES_MESSAGES.approveVendor : ADMIN_RES_MESSAGES.rejectVendor}`
        };
    }
}
