import { IVerifyKycUseCase } from "../../../domain/interfaces/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";


export class VerifyKyc implements IVerifyKycUseCase{
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }

        const isVerified = await this.userRepository.verifyKyc(userId)
        return isVerified
    }
}