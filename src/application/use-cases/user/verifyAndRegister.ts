import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { CreateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IVerifyAndRegisterUseCase } from "../../../domain/interfaces/usecases.interface";


@injectable()
export class VerifyAndRegister implements IVerifyAndRegisterUseCase{
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    ) { }

    async execute(userData: CreateUserDTO & { createdAt: Date, updatedAt: Date }): Promise<IUser> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.userRepository.createUser(userData)
        if (!user) {
            throw new AppError('Failed to create user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
        return user;
    }
}