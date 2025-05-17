import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUpdateVendorReqUseCase } from "../../../domain/interfaces/usecases.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import logger from "../../../utils/logger";
import { IMailService } from "../../../domain/services/mailService.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";


@injectable()
export class UpdateVendorReq implements IUpdateVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepo: IUserRepository,
        @inject(TOKENS.MailService) private readonly mailService: IMailService,
    ) { }

    async execute(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }> {
        const vendor = await this.userRepo.findUserById(vendorId)
        if (!vendor) {
            throw new AppError('Vendor not found', HttpStatusCode.BAD_REQUEST)
        }

        if (vendor.isVerified && isVerified) {
            throw new AppError('Vendor already verified', HttpStatusCode.CONFLICT)
        }

        const updateData: Partial<typeof vendor> = {
            isVerified,
            verificationReason,
        };

        if (!isVerified) {
            updateData.kycDocuments = [];
            await this.mailService.sendVendorRejectionEmail(vendor.email, verificationReason);
        }

        await this.userRepo.updateUser(vendorId, updateData);

        logger.info(`Vendor verification ${isVerified ? 'approved' : 'rejected'} for ${vendor.email}`);

        return {
            message: `Vendor ${isVerified ? 'approved' : 'rejected'} successfully`
        }
    }
}