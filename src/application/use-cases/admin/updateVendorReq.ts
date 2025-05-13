import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { IUpdateVendorReqUseCase } from "../../../domain/interfaces/usecases.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import logger from "../../../utils/logger";
import { IMailService } from "../../interfaces/mailService.interface";


@injectable()
export class UpdateVendorReq implements IUpdateVendorReqUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepo: IUserRepository,
        @inject(TOKENS.MailService) private readonly mailService: IMailService,
    ) { }

    async execute(vendorId: string, isVerified: boolean, verificationReason: string): Promise<{ message: string }> {
        const vendor = await this.userRepo.findById(vendorId)
        if (!vendor) {
            throw new AppError('Vendor not found', HttpStatusCode.BAD_REQUEST)
        }

        if (vendor.isVerified && isVerified) {
            throw new AppError('Vendor already verified', HttpStatusCode.CONFLICT)
        }

        await this.userRepo.updateUser(vendorId, { isVerified, verificationReason })

        if (!isVerified) {
            await this.mailService.sendVendorRejectionEmail(vendor.email, verificationReason);
        }

        logger.info(`Vendor verification ${isVerified ? 'approved' : 'rejected'} for ${vendor.email}`);

        return {
            message: `Vendor ${isVerified ? 'approved' : 'rejected'} successfully`
        }
    }
}