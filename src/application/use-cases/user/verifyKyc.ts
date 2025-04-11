import { IUserRepository } from "../../../domain/interfaces/user.interface";


export class VerifyKyc {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found')
        }

        const isVerified = await this.userRepository.verifyKyc(userId)
        return isVerified
    }
}