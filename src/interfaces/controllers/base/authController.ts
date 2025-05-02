import { Response } from "express";
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user/user.dto";
import { container, inject, injectable } from "tsyringe";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { env } from "../../../infrastructure/config/env";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { IAuthService } from "../../../application/interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";
import { IForgotPasswordUseCase, IGoogleLoginUseCase, ILoginUserUseCase, ILogoutUserUseCase, IRegisterUserUseCase, IResendOtpUseCase, IUpdatePasswordUseCase, IUpdateUserUseCase, IVerifyOtpUseCase } from "../../../domain/interfaces/usecases.interface";
import { setAccessCookie, setRefreshCookie } from "../../../utils/setCookies";

@injectable()
export class AuthController {
    constructor(
        @inject(TOKENS.RegisterUserUseCase) private registerUser: IRegisterUserUseCase,
        @inject(TOKENS.LoginUserUseCase) private loginUser: ILoginUserUseCase,
        @inject(TOKENS.UpdateUserUseCase) private updateUser: IUpdateUserUseCase,
        @inject(TOKENS.ResendOtpUseCase) private resendOtp: IResendOtpUseCase,
        @inject(TOKENS.ForgotPasswordUseCase) private forgotPass: IForgotPasswordUseCase,
        @inject(TOKENS.UpdatePasswordUseCase) private updatePass: IUpdatePasswordUseCase,
        @inject(TOKENS.VerifyOtpUseCase) private verifyOtp: IVerifyOtpUseCase,
        @inject(TOKENS.LogoutUserUseCase) private logoutUser: ILogoutUserUseCase,
        @inject(TOKENS.GoogleLoginUseCase) private googleLogin: IGoogleLoginUseCase,
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
            const { userId, purpose } = req.body;
            if (!userId || !purpose) {
                throw new AppError('Userid and purpose are required', HttpStatusCode.BAD_REQUEST);
            }
            const result = await this.resendOtp.execute(userId, purpose);

            ResponseHandler.success(res, result.message, null, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async login(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password, role } = req.body
            if (!email || !password || !role) {
                throw new AppError('Email password and role are required', HttpStatusCode.BAD_REQUEST)
            }
            const { accessToken, refreshToken, user } = await this.loginUser.execute(email, password, role)
            
            setAccessCookie(accessToken, res);
            setRefreshCookie(refreshToken, res);

            ResponseHandler.success(res, 'Login successfull', user, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async loginGoogle(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { credential, role } = req.body;

            if (!credential || !role) {
                throw new AppError('Google token and role are required', HttpStatusCode.BAD_REQUEST);
            }

            const { accessToken, refreshToken, user } = await this.googleLogin.execute(credential, role);

            res
                .cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: jwtConfig.accessToken.maxAge
                })
                .cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: jwtConfig.refreshToken.maxAge
                });

            ResponseHandler.success(res, 'Google login successful', user, HttpStatusCode.OK);
        } catch (error: any) {
            throw error;
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
            const { email, role } = req.body
            if (!email || !role) {
                throw new AppError('Email and role missing in body', HttpStatusCode.BAD_REQUEST)
            }

            const data = await this.forgotPass.execute(email, role)
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
            const accessToken = req.cookies['access_token'];
            const refreshToken = req.cookies['refresh_token'];

            if (!accessToken || !refreshToken) {
                throw new AppError('Access or Refresh token missing in cookies', HttpStatusCode.BAD_REQUEST);
            }

            let userId: string;

            const authService = container.resolve<IAuthService>(TOKENS.AuthService);

            try {
                const decoded = authService.verifyAccessToken(accessToken);
                if (!decoded || !decoded.userId) {
                    throw new AppError('UserId missing in access token', HttpStatusCode.BAD_REQUEST);
                }
                userId = decoded.userId;
            } catch {
                const decodedRefresh = authService.verifyRefreshToken(refreshToken);
                if (!decodedRefresh || !decodedRefresh.userId) {
                    throw new AppError('UserId missing in refresh token', HttpStatusCode.BAD_REQUEST);
                }
                userId = decodedRefresh.userId;
            }

            await this.logoutUser.execute(userId, accessToken);

            res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'strict' });
            res.clearCookie('refresh_token', { httpOnly: true, secure: true, sameSite: 'strict' });

            ResponseHandler.success(res, 'Logged out successfully', null, HttpStatusCode.OK);
        } catch (error: any) {
            throw new AppError(error.message || 'Logout failed', HttpStatusCode.UNAUTHORIZED);
        }
    }
}