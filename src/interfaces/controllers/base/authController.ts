import { Response } from "express";
import { CreateUserDTO } from "../../dtos/user/user.dto";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { env } from "../../../infrastructure/config/env";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";
import { setAccessCookie, setRefreshCookie } from "../../../utils/setCookies";
import { IAuthUseCases } from "../../../domain/interfaces/auth.interface";

@injectable()
export class AuthController {
    constructor(
        @inject(TOKENS.AuthUseCases) private _authUseCases: IAuthUseCases
    ) { }

    async register(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userData: CreateUserDTO = req.body
            if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.phone) {
                throw new AppError('Name, email and password are required', HttpStatusCode.BAD_REQUEST);
            }

            const newUser = await this._authUseCases.register(userData)
            ResponseHandler.success(res, 'User registration on progress', newUser, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async resendOtp(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { userId, purpose } = req.body;
            if (!userId || !purpose) {
                throw new AppError('Userid and purpose are required', HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._authUseCases.resendOtp(userId, purpose);

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
            const { accessToken, refreshToken, user } = await this._authUseCases.login(email, password, role)

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

            const { accessToken, refreshToken, user } = await this._authUseCases.loginGoogle(credential, role);

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

    async forgotPassword(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, role } = req.body
            if (!email || !role) {
                throw new AppError('Email and role missing in body', HttpStatusCode.BAD_REQUEST)
            }

            const data = await this._authUseCases.forgotPass(email, role)
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

            await this._authUseCases.resetPass(email, password)
            ResponseHandler.success(res, 'Password updated successfully', null, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async verifyOTP(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { userId, otp, purpose } = req.body;

            const data = await this._authUseCases.verifyOtp(userId, otp, purpose)
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

            const { message } = await this._authUseCases.logout(accessToken, refreshToken);

            res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'strict' });
            res.clearCookie('refresh_token', { httpOnly: true, secure: true, sameSite: 'strict' });

            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error: any) {
            throw new AppError(error.message || 'Logout failed', HttpStatusCode.UNAUTHORIZED);
        }
    }
}