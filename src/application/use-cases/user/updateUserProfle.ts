import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { UpdateUserDTO } from "../../../interfaces/dtos/user/user.dto";

export class UpdateUser {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string, userData: UpdateUserDTO): Promise<IUser> {
        const existingUser = await this.userRepository.findById(userId)
        if (!existingUser) {
            throw new Error('User not found');
        }

        const updatedUser = await this.userRepository.updateUser(userId, userData)
        return updatedUser;
    }
}