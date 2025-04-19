import { Request, Response } from "express";
import { LoginUser } from "../../application/use-cases/user/loginUser";
import { RegisterUser } from "../../application/use-cases/user/registerUser";
import { UpdateUser } from "../../application/use-cases/user/updateUserProfle";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user/user.dto";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { env } from "../../config/env";
import { jwtConfig } from "../../config/jwtConfig";
import { VerifyOtpAndRegister } from "../../application/use-cases/user/verifyOtpAndRegister";
import { ResendOtp } from "../../application/use-cases/user/resendOtp";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { ForgotPass } from "../../application/use-cases/user/forgotPass";
import { UpdatePassword } from "../../application/use-cases/user/updatePassword";

@injectable()
export class UserController {
    constructor(
        @inject(RegisterUser) private registerUser: RegisterUser,
        @inject(LoginUser) private loginUser: LoginUser,
        @inject(UpdateUser) private updateUser: UpdateUser,
        @inject(VerifyOtpAndRegister) private verifyOtp: VerifyOtpAndRegister,
        @inject(ResendOtp) private resendOtp: ResendOtp,
        @inject(ForgotPass) private forgotPass: ForgotPass,
        @inject(UpdatePassword) private updatePass: UpdatePassword,
    ) { }

    async register(req: Request, res: Response): Promise<void> {
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

    async verifyOtpAndRegister(req: Request, res: Response): Promise<void> {
        try {
            const { userId, otp } = req.body
            if (!userId || !otp) {
                throw new AppError('UserId, OTP are required', HttpStatusCode.BAD_REQUEST);
            }
            const newUser = await this.verifyOtp.execute(userId, otp)
            ResponseHandler.success(res, 'User created successfully', newUser, HttpStatusCode.CREATED)
        } catch (error: any) {
            throw error
        }
    }

    async resentOtp(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;
            if (!userId) {
                throw new AppError('Userid is required', HttpStatusCode.BAD_REQUEST);
            }
            await this.resendOtp.execute(userId);

            ResponseHandler.success(res, 'Otp sent successfully', null, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async login(req: Request, res: Response): Promise<void> {
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
            ResponseHandler.success(res, 'Login successfull', { user, accessToken, refreshToken }, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
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

    async forgotPassword(req: Request, res: Response): Promise<void> {
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

    async updatePassword(req: Request, res: Response): Promise<void> {
        try {
            const { userId, password, otp } = req.body
            if (!userId || !password || !otp) {
                throw new AppError('User ID, password, and OTP are required.', HttpStatusCode.BAD_REQUEST);
            }

            await this.updatePass.execute(userId, password, otp)
            ResponseHandler.success(res, 'Password updated successfully', null, HttpStatusCode.OK)
        } catch (error: any) {
            throw error
        }
    }

}