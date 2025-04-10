import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { CreateUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IAuthService } from "../../interfaces/authService.interface";


export class RegisterUser {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthService
    ) { }

    async execute(userData: CreateUserDTO): Promise<{ token: string, user: IUser }> {
        const existingUser = await this.userRepository.findByEmail(userData.email)

        if (existingUser) {
            throw new Error('User already exists')
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

        const token = this.authService.generateToken(newUser._id!)
        return {
            token,
            user: newUser
        }
    }
}