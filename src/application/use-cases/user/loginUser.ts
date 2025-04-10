import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { IAuthService } from "../../interfaces/authService.interface";


export class LoginUser {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthService
    ) { }

    async execute(email: string, password: string): Promise<{ token: string, user: IUser }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("User not found")
        }

        const isValidPass = await this.authService.comparePassword(password, user.password)

        if (!isValidPass) {
            throw new Error("Invalid password")
        }

        const token = this.authService.generateToken(user._id!)

        return {
            token,
            user
        }
    }
}