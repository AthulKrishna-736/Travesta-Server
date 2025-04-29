import { injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

@injectable()
export class GetUser {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<IUser> {
        const user = await this.userRepository.findById(userId)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        return user
    }
}