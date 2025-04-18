import e, { Request, Response } from "express";
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

@injectable()
export class UserController {
    constructor(
        @inject(RegisterUser) private registerUser: RegisterUser,
        @inject(LoginUser) private loginUser: LoginUser,
        @inject(UpdateUser) private updateUser: UpdateUser,
        @inject(VerifyOtpAndRegister) private verifyOtp: VerifyOtpAndRegister
    ) { }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const userData: CreateUserDTO = req.body
            if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.phone) {
                throw new AppError('Name, email and password are required', HttpStatusCode.BAD_REQUEST);
            }
            const newUser = await this.registerUser.execute(userData)
            res.status(HttpStatusCode.CREATED).json({ success: true, data: newUser })
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
            res.status(HttpStatusCode.CREATED).json({ success: true, data: newUser });
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
                .status(HttpStatusCode.OK)
                .json({ success: true, user, accessToken, refreshToken });
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
            res.status(HttpStatusCode.OK).json({ success: true, updateUser })
        } catch (error: any) {
            throw error
        }
    }

}