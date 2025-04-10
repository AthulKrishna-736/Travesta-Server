import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";


export class GetUser {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<IUser> {
        const user = await this.userRepository.findById(userId)
        if (!user) {
            throw new Error('No user exists with this id')
        }
        return user
    }
}