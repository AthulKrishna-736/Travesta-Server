import fs from 'fs';
import path from 'path';
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { IUpdateUserUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TUpdateUserData } from "../../../domain/interfaces/model/user.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { UserLookupBase } from "../base/userLookup.base";
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";

@injectable()
export class UpdateUser extends UserLookupBase implements IUpdateUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) {
        super(_userRepository)
    }

    async updateUser(userId: string, userData: TUpdateUserData, file?: Express.Multer.File): Promise<{ user: TResponseUserDTO, message: string }> {

        const userEntity = await this.getUserEntityOrThrow(userId);

        if (file) {
            const filePath = file.path;
            const fileExtension = path.extname(filePath);
            const s3Key = `users/profile_${userId}${fileExtension}`;

            await this._awsS3Service.uploadFileToAws(s3Key, filePath);

            userEntity.updateProfile({ profileImage: s3Key });

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                } else {
                    console.log(`Successfully deleted local file: ${filePath}`);
                }
            });
        }

        if (userData.password) {
            const hashPass = await this._authService.hashPassword(userData.password as string);
            userData.password = hashPass;
        }

        userEntity.updateProfile(userData);

        const persistableData = userEntity.getPersistableData();

        const updatedUserData = await this._userRepository.updateUser(userId, persistableData);

        if (!updatedUserData) {
            throw new AppError(AUTH_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        if (file && updatedUserData.profileImage) {
            updatedUserData.profileImage = await this._awsS3Service.getFileUrlFromAws(updatedUserData.profileImage as string, awsS3Timer.expiresAt);
            await this._redisService.storeRedisSignedUrl(updatedUserData._id as string, updatedUserData.profileImage, awsS3Timer.expiresAt);
        } else {
            const signedUrl = await this._redisService.getRedisSignedUrl(updatedUserData._id!, 'profile');
            updatedUserData.profileImage = signedUrl as string;
        }

        if (updatedUserData.kycDocuments && updatedUserData.kycDocuments.length > 0) {
            let kycDocs = await this._redisService.getRedisSignedUrl(updatedUserData._id!, 'kycDocs');
            if (!kycDocs) {
                kycDocs = await Promise.all(updatedUserData.kycDocuments.map(async (i) => await this._awsS3Service.getFileUrlFromAws(i, awsS3Timer.expiresAt)));
                await this._redisService.storeKycDocs(updatedUserData._id!, kycDocs, awsS3Timer.expiresAt)
            }
            updatedUserData.kycDocuments = kycDocs as string[];
        }

        const mapUser = ResponseMapper.mapUserToResponseDTO(updatedUserData);

        return {
            user: mapUser,
            message: AUTH_RES_MESSAGES.update,
        };
    }
}
