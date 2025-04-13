import { injectable, inject } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { CreateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

@injectable()
export class RegisterUser {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService
    ) { }

    async execute(userData: CreateUserDTO): Promise<IUser> {
        const existingUser = await this.userRepository.findByEmail(userData.email)

        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST)
        }

        const hashPass = await this.authService.hashPassword(userData.password)

        const newUserData = {
            ...userData,
            password: hashPass,
            role: userData.role || 'user',
            subscriptionType: userData.subscriptionType || 'basic',
            createdAt: new Date(),
            updateAt: new Date()
        };

        const newUser = await this.userRepository.createUser(newUserData);

        return newUser
    }
}