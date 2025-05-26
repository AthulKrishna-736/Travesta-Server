import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { setAccessCookie, setRefreshCookie } from "../../utils/setCookies";
import { IForgotPassUseCase, IGoogleLoginUseCase, ILoginUseCase, ILogoutUseCases, IRegisterUseCase, IResendOtpUseCase, IResetPassUseCase, IVerifyOtpUseCase } from "../../domain/interfaces/model/auth.interface";

@injectable()
export class AuthController {
    constructor(
        @inject(TOKENS.LoginUseCase) private _loginUseCase: ILoginUseCase,
        @inject(TOKENS.RegisterUseCase) private _registerUseCase: IRegisterUseCase,
        @inject(TOKENS.GoogleLoginUseCase) private _googleLoginUseCase: IGoogleLoginUseCase,
        @inject(TOKENS.ForgotPassUseCase) private _forgotPassUseCase: IForgotPassUseCase,
        @inject(TOKENS.ResetPassUseCase) private _resetPassUseCase: IResetPassUseCase,
        @inject(TOKENS.ResendOtpUseCase) private _resendOtpUseCase: IResendOtpUseCase,
        @inject(TOKENS.VerifyOtpUseCase) private _verifyOtpUseCase: IVerifyOtpUseCase,
        @inject(TOKENS.LogoutUseCase) private _logoutOtpUseCase: ILogoutUseCases,

    ) { }

    async register(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userData: CreateUserDTO = req.body
            const newUser = await this._registerUseCase.register(userData)
            ResponseHandler.success(res, 'User registration on progress', newUser, HttpStatusCode.OK)
        } catch (error) {
            throw error
        }
    }

    async resendOtp(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { userId, purpose } = req.body;
            if (!userId || !purpose) {
                throw new AppError('Userid and purpose are required', HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._resendOtpUseCase.resendOtp(userId, purpose);

            ResponseHandler.success(res, result.message, null, HttpStatusCode.OK)
        } catch (error) {
            throw error
        }
    }

    async login(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password, role } = req.body
            if (!email || !password || !role) {
                throw new AppError('Email password and role are required', HttpStatusCode.BAD_REQUEST)
            }
            const { accessToken, refreshToken, user } = await this._loginUseCase.login(email, password, role)

            setAccessCookie(accessToken, res);
            setRefreshCookie(refreshToken, res);

            ResponseHandler.success(res, 'Login successfull', user, HttpStatusCode.OK)
        } catch (error) {
            throw error
        }
    }

    async loginGoogle(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { credential, role } = req.body;

            if (!credential || !role) {
                throw new AppError('Google token and role are required', HttpStatusCode.BAD_REQUEST);
            }

            const { accessToken, refreshToken, user } = await this._googleLoginUseCase.loginGoogle(credential, role);

            setAccessCookie(accessToken, res);
            setRefreshCookie(refreshToken, res);

            ResponseHandler.success(res, 'Google login successful', user, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async forgotPassword(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, role } = req.body
            if (!email || !role) {
                throw new AppError('Email and role missing in body', HttpStatusCode.BAD_REQUEST)
            }

            const data = await this._forgotPassUseCase.forgotPass(email, role)
            ResponseHandler.success(res, data.message, data.userId, HttpStatusCode.OK)
        } catch (error) {
            throw error
        }
    }

    async updatePassword(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                throw new AppError('User email or password are required.', HttpStatusCode.BAD_REQUEST);
            }

            await this._resetPassUseCase.resetPass(email, password)
            ResponseHandler.success(res, 'Password updated successfully', null, HttpStatusCode.OK)
        } catch (error) {
            throw error
        }
    }

    async verifyOTP(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { userId, otp, purpose } = req.body;

            const data = await this._verifyOtpUseCase.verifyOtp(userId, otp, purpose)
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

            const { message } = await this._logoutOtpUseCase.logout(accessToken, refreshToken);

            res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'strict' });
            res.clearCookie('refresh_token', { httpOnly: true, secure: true, sameSite: 'strict' });

            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }
}