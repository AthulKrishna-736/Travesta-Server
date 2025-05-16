import { inject, injectable } from "tsyringe";
import { ResponseUserDTO, UpdateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IUpdateUserUseCase } from "../../../domain/interfaces/usecases.interface";
import { IAwsS3Service } from "../../interfaces/awsS3Service.interface";
import path from 'path';
import fs from 'fs'
import { IUserRepository } from "../../../domain/repositories/repository.interface";

@injectable()
export class UpdateUser implements IUpdateUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly _userRepository: IUserRepository,
        @inject(TOKENS.AwsS3Service) private readonly _awsS3Service: IAwsS3Service,
    ) { }

    async execute(userId: string, userData: UpdateUserDTO, file?: Express.Multer.File): Promise<{ user: ResponseUserDTO, message: string }> {
        const existingUser = await this._userRepository.findUserById(userId);
        if (!existingUser) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
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

        const updates: Omit<UpdateUserDTO, 'isVerified'> = { ...userData };

        const updatedUser = await this._userRepository.updateUser(userId, updates);

        if (!updatedUser) {
            throw new AppError('error while updating user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const signedUrl = await this._awsS3Service.getFileUrlFromAws(updatedUser.profileImage!, 86400)

        const mappedUser: ResponseUserDTO = {
            id: updatedUser._id!,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            isGoogle: updatedUser.isGoogle!,
            isBlocked: updatedUser.isBlocked,
            wishlist: updatedUser.wishlist,
            subscriptionType: updatedUser.subscriptionType,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            profileImage: signedUrl,
        };

        return {
            user: mappedUser,
            message: 'User updated successfully',
        };
    }

}