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
import { IAuthService } from "../../../domain/interfaces/services/authService.interface";
import { ResponseMapper } from "../../../utils/responseMapper";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { AUTH_RES_MESSAGES } from "../../../constants/resMessages";
import { TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";

@injectable()
export class UpdateUser implements IUpdateUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
        @inject(TOKENS.AuthService) private _authService: IAuthService,
    ) { }

    async updateUser(userId: string, userData: TUpdateUserData, file?: Express.Multer.File): Promise<{ user: TResponseUserDTO, message: string }> {
        const user = await this._userRepository.findUserById(userId);
        if (!user) {
            throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        if (file) {
            const filePath = file.path;
            const fileExtension = path.extname(filePath);
            const s3Key = `users/profile_${userId}${fileExtension}`;

            await this._awsS3Service.uploadFileToAws(s3Key, filePath);
            userData.profileImage = s3Key;

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

        const updatedUser = await this._userRepository.updateUser(userId, userData);
        if (!updatedUser) {
            throw new AppError(AUTH_ERROR_MESSAGES.updateFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        if (updatedUser.profileImage) {
            updatedUser.profileImage = await this._awsS3Service.getFileUrlFromAws(updatedUser.profileImage, awsS3Timer.expiresAt);
        }

        if (updatedUser.kycDocuments && updatedUser.kycDocuments.length > 0) {
            updatedUser.kycDocuments = await Promise.all(
                updatedUser.kycDocuments.map((key) => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            )
        }

        const mapUser = ResponseMapper.mapUserToResponseDTO(updatedUser);

        return {
            user: mapUser,
            message: AUTH_RES_MESSAGES.update,
        };
    }
}
