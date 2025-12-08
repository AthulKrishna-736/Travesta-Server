import { NextFunction, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { setAccessCookie, setRefreshCookie } from "../../utils/setCookies";
import { IForgotPassUseCase, IGoogleLoginUseCase, ILoginUseCase, ILogoutUseCases, IRegisterUseCase, IResendOtpUseCase, IResetPassUseCase, IVerifyOtpUseCase } from "../../domain/interfaces/model/auth.interface";
import { TCreateUserDTO } from "../dtos/user.dto";
import { AUTH_RES_MESSAGES } from "../../constants/resMessages";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { IAuthController } from "../../domain/interfaces/controllers/authController.interface";


@injectable()
export class AuthController implements IAuthController {
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

    async register(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { firstName, lastName, email, phone, password, role } = req.body
            const userData: TCreateUserDTO = {
                firstName,
                lastName,
                email,
                password,
                phone,
                role,
            }

            const newUser = await this._registerUseCase.register(userData)
            ResponseHandler.success(res, AUTH_RES_MESSAGES.register, newUser, HttpStatusCode.OK)
        } catch (error) {
            next(error);
        }
    }

    async resendOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, purpose } = req.body;
            if (!userId || !purpose) {
                throw new AppError(AUTH_ERROR_MESSAGES.resendOtp, HttpStatusCode.BAD_REQUEST);
            }
            const { message } = await this._resendOtpUseCase.resendOtp(userId, purpose);
            ResponseHandler.success(res, message, null, HttpStatusCode.OK)
        } catch (error) {
            next(error);
        }
    }

    async login(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, role } = req.body;
            if (!email || !password || !role) {
                throw new AppError(AUTH_ERROR_MESSAGES.login, HttpStatusCode.BAD_REQUEST)
            }
            const { accessToken, refreshToken, user } = await this._loginUseCase.login(email, password, role);

            setAccessCookie(accessToken, res);
            setRefreshCookie(refreshToken, res);

            ResponseHandler.success(res, AUTH_RES_MESSAGES.login, user, HttpStatusCode.OK)
        } catch (error) {
            next(error);
        }
    }

    async loginGoogle(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { credential, role } = req.body;

            if (!credential || !role) {
                throw new AppError(AUTH_ERROR_MESSAGES.loginGoogle, HttpStatusCode.BAD_REQUEST);
            }

            const { accessToken, refreshToken, user } = await this._googleLoginUseCase.loginGoogle(credential, role);

            setAccessCookie(accessToken, res);
            setRefreshCookie(refreshToken, res);

            ResponseHandler.success(res, AUTH_RES_MESSAGES.googleLogin, user, HttpStatusCode.OK);
        } catch (error) {
            next(error);;
        }
    }

    async forgotPassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, role } = req.body
            if (!email || !role) {
                throw new AppError(AUTH_ERROR_MESSAGES.forgotPass, HttpStatusCode.BAD_REQUEST)
            }

            const { message, userId } = await this._forgotPassUseCase.forgotPass(email, role)
            ResponseHandler.success(res, message, userId, HttpStatusCode.OK)
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                throw new AppError(AUTH_ERROR_MESSAGES.updatePass, HttpStatusCode.BAD_REQUEST);
            }

            await this._resetPassUseCase.resetPass(email, password)
            ResponseHandler.success(res, AUTH_RES_MESSAGES.resetPass, null, HttpStatusCode.OK)
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, otp, purpose } = req.body;

            const { data, isOtpVerified } = await this._verifyOtpUseCase.verifyOtp(userId, otp, purpose)
            if (!isOtpVerified) {
                throw new AppError(AUTH_ERROR_MESSAGES.verifyError, HttpStatusCode.BAD_REQUEST)
            }

            ResponseHandler.success(res, AUTH_RES_MESSAGES.verifyOtp, data, HttpStatusCode.OK)
        } catch (error) {
            next(error);
        }
    }

    async logout(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const accessToken = req.cookies['access_token'];
            const refreshToken = req.cookies['refresh_token'];

            if (!accessToken || !refreshToken) {
                throw new AppError(AUTH_ERROR_MESSAGES.jwtMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message } = await this._logoutOtpUseCase.logout(accessToken, refreshToken);

            res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'strict' });
            res.clearCookie('refresh_token', { httpOnly: true, secure: true, sameSite: 'strict' });

            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}