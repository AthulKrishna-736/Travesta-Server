import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";



export class DeleteUser {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        await this.userRepository.deleteUser(userId)
    }
}