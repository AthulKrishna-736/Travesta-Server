import path from 'path';
import fs from 'fs';
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { IUpdateKycUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { ResponseMapper } from "../../../utils/responseMapper";
import { VENDOR_RES_MESSAGES } from "../../../constants/resMessages";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TResponseUserDTO } from '../../../interfaceAdapters/dtos/user.dto';

@injectable()
export class UpdateKycUseCase implements IUpdateKycUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _s3Service: IAwsS3Service,
    ) { }

    async updateKyc(userId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: TResponseUserDTO, message: string }> {
        const user = await this._userRepository.findUserById(userId);

        if (!user) throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        const uploadAndClean = async (file: Express.Multer.File, name: string) => {
            const ext = path.extname(file.path);
            const key = `users/kyc_${name}_${userId}${ext}`;
            await this._s3Service.uploadFileToAws(key, file.path);
            fs.unlink(file.path, (err) => {
                if (err) console.error("Failed to clean local file", err);
            });
            return key;
        };

        const [frontKey, backKey] = await Promise.all([
            uploadAndClean(frontFile, "front"),
            uploadAndClean(backFile, "back"),
        ]);

        const existingDocs = user.kycDocuments || [];
        const updatedDocs = [...existingDocs, frontKey, backKey];

        const updatedUser = await this._userRepository.updateUser(userId, { kycDocuments: updatedDocs });

        if (!updatedUser) {
            throw new AppError(AUTH_ERROR_MESSAGES.updateFail, HttpStatusCode.BAD_REQUEST);
        }

        if (updatedUser.kycDocuments && updatedUser.kycDocuments.length > 0) {
            updatedUser.kycDocuments = await Promise.all(
                updatedUser.kycDocuments.map((key) => this._s3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );
        }

        const mappedUser = ResponseMapper.mapUserToResponseDTO(updatedUser);

        return {
            vendor: mappedUser,
            message: VENDOR_RES_MESSAGES.kyc,
        };
    }
}
