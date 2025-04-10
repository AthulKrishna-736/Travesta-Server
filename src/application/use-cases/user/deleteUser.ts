import { IUserRepository } from "../../../domain/interfaces/user.interface";



export class DeleteUser {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }
        await this.userRepository.deleteUser(userId)
    }
}