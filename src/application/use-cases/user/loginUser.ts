import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { IAuthService } from "../../interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";

@injectable()
export class LoginUser {
    constructor(
        @inject(TOKENS.UserRepository) private readonly userRepository: IUserRepository,
        @inject(TOKENS.AuthService) private readonly authService: IAuthService
    ) { }

    async execute(email: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: IUser }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("User not found")
        }

        const isValidPass = await this.authService.comparePassword(password, user.password)

        if (!isValidPass) {
            throw new Error("Invalid password")
        }

        const accessToken = this.authService.generateAccessToken(user._id!);
        const refreshToken = this.authService.generateRefreshToken(user._id!);

        return {
            accessToken,
            refreshToken,
            user
        }
    }
}