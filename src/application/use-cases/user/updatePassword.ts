import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { IAuthService } from "../../interfaces/authService.interface";


export class UpdatePassword {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthService
    ) { }

    async execute(userId: string, password: string): Promise<void> {
        const existingUser = await this.userRepository.findById(userId)
        if (!existingUser) {
            throw new Error('User does not exists!');
        }

        const isMatch = await this.authService.comparePassword(existingUser.password, password)

        if (isMatch) {
            throw new Error('New password cannot be old password')
        }

        const hashPass = await this.authService.hashPassword(password)
        await this.userRepository.updatePassword(userId, hashPass)
    }
}