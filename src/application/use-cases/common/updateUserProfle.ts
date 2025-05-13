import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { ResponseUserDTO, UpdateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { IUpdateUserUseCase } from "../../../domain/interfaces/usecases.interface";

@injectable()
export class UpdateUser implements IUpdateUserUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string, userData: UpdateUserDTO): Promise<{ user: ResponseUserDTO, message: string }> {
        const existingUser = await this.userRepository.findById(userId)
        if (!existingUser) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        const updates: Omit<UpdateUserDTO, 'isVerified'> = { ...userData }

        const updatedUser = await this.userRepository.updateUser(userId, updates)

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
        }
        return {
            user: mappedUser,
            message: 'User updated successfully'
        };
    }
}