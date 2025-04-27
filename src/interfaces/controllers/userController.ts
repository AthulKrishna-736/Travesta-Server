import { Request, Response } from "express";
import { LoginUser } from "../../application/use-cases/user/loginUser";
import { RegisterUser } from "../../application/use-cases/user/registerUser";
import { UpdateUser } from "../../application/use-cases/user/updateUserProfle";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user/user.dto";
import { container, inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { env } from "../../config/env";
import { jwtConfig } from "../../config/jwtConfig";
import { ResendOtp } from "../../application/use-cases/user/resendOtp";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { ForgotPass } from "../../application/use-cases/user/forgotPass";
import { UpdatePassword } from "../../application/use-cases/user/updatePassword";
import { VerifyOtp } from "../../application/use-cases/verifyOtp";
import { LogoutUser } from "../../application/use-cases/user/logoutUser";
import { IAuthService } from "../../application/interfaces/authService.interface";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";

@injectable()
export class UserController {
    constructor(
        @inject(RegisterUser) private registerUser: RegisterUser,
        @inject(LoginUser) private loginUser: LoginUser,
        @inject(UpdateUser) private updateUser: UpdateUser,
        @inject(ResendOtp) private resendOtp: ResendOtp,
        @inject(ForgotPass) private forgotPass: ForgotPass,
        @inject(UpdatePassword) private updatePass: UpdatePassword,
        @inject(VerifyOtp) private verifyOtp: VerifyOtp,
        @inject(LogoutUser) private logoutUser: LogoutUser,
    ) { }

    async register(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userData: CreateUserDTO = req.body
            if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.phone) {
                throw new AppError('Name, email and password are required', HttpStatusCode.BAD_REQUEST);
            }

            const newUser = await this.registerUser.execute(userData)
            ResponseHandler.success(res, 'User registration on progress', newUser, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async resentOtp(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.body;
            if (!userId) {
                throw new AppError('Userid is required', HttpStatusCode.BAD_REQUEST);
            }
            const result = await this.resendOtp.execute(userId);

            ResponseHandler.success(res, result.message, null, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async login(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                throw new AppError('Email and password are required', HttpStatusCode.BAD_REQUEST)
            }
            const { accessToken, refreshToken, user } = await this.loginUser.execute(email, password)
            res
                .cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV == 'production',
                    sameSite: 'strict',
                    maxAge: jwtConfig.accessToken.maxAge
                })
                .cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV == 'production',
                    sameSite: 'strict',
                    maxAge: jwtConfig.refreshToken.maxAge
                })
            ResponseHandler.success(res, 'Login successfull', user, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async updateProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new AppError('User id is missing', HttpStatusCode.BAD_REQUEST)
            }
            const userData: UpdateUserDTO = req.body
            const updateUser = await this.updateUser.execute(userId, userData)
            ResponseHandler.success(res, 'Profile updated successfully', updateUser, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async forgotPassword(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email } = req.body
            if (!email) {
                throw new AppError('Email missing in body', HttpStatusCode.BAD_REQUEST)
            }

            const data = await this.forgotPass.execute(email)
            ResponseHandler.success(res, data.message, data.userId, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async updatePassword(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                throw new AppError('User email or password are required.', HttpStatusCode.BAD_REQUEST);
            }

            await this.updatePass.execute(email, password)
            ResponseHandler.success(res, 'Password updated successfully', null, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async verifyOTP(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { userId, otp, purpose } = req.body;

            const data = await this.verifyOtp.execute(userId, otp, purpose)
            if (!data.isOtpVerified) {
                throw new AppError('Otp verification failed or session expired', HttpStatusCode.BAD_REQUEST)
            }

            ResponseHandler.success(res, 'Otp verified successfully', data.data, HttpStatusCode.OK)
        } catch (error) {
            throw error
        }
    }

    async logout(req: CustomRequest, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new AppError('Authorization header missing', HttpStatusCode.UNAUTHORIZED);
            }

            const tokenString = authHeader.split(' ')[1];
            const [accessToken, refreshToken] = tokenString.split('::');

            if (!accessToken || !refreshToken) {
                throw new AppError('Missing tokens', HttpStatusCode.BAD_REQUEST);
            }

            const authService = container.resolve<IAuthService>(TOKENS.AuthService);

            let userId: string;

            try {
                const decoded = authService.verifyAccessToken(accessToken)
                if (!decoded || !decoded.userId) {
                    throw new AppError('UserId missing in access token', HttpStatusCode.BAD_REQUEST)
                }
                userId = decoded.userId


            } catch (error: any) {
                const decodedRefresh = authService.verifyRefreshToken(refreshToken)
                if (!decodedRefresh || !decodedRefresh.userId) {
                    throw new AppError('UserId missing in refresh token', HttpStatusCode.BAD_REQUEST)
                }
                userId = decodedRefresh.userId
            }

            await this.logoutUser.execute(userId, accessToken)

            res.clearCookie('access_token')
            res.clearCookie('refresh_token')

            ResponseHandler.success(res, 'Logged out successfully', null, HttpStatusCode.OK);
        } catch (error: any) {
            throw new AppError(error.message || 'Logout failed', HttpStatusCode.UNAUTHORIZED)
        }
    }

}