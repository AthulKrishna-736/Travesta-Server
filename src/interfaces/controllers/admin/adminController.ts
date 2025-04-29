import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";
import { ILoginUserUseCase } from "../../../domain/interfaces/usecases.interface";
import { LogoutUser } from "../../../application/use-cases/auth/logoutUser";
import { IAuthService } from "../../../application/interfaces/authService.interface";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { env } from "process";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { BlockUnblockUser } from "../../../application/use-cases/admin/blockUser";
import { GetAllUsers } from "../../../application/use-cases/admin/getAllUsers";

@injectable()
export class AdminController {
    constructor(
        @inject(TOKENS.LoginUserUseCase) private loginUser: ILoginUserUseCase,
        @inject(LogoutUser) private logoutUser: LogoutUser,
        @inject(TOKENS.AuthService) private authService: IAuthService,
        @inject(BlockUnblockUser) private blockUnblockUser: BlockUnblockUser,
        @inject(GetAllUsers) private getAllUsersUsecase: GetAllUsers,
    ) { }

    async login(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new AppError('Email and password are required', HttpStatusCode.BAD_REQUEST);
            }

            const { accessToken, refreshToken, user } = await this.loginUser.execute(email, password, 'admin');

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

            ResponseHandler.success(res, 'Admin login successful', user, HttpStatusCode.OK);
        } catch (error: any) {
            throw error;
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

            try {
                const decoded = this.authService.verifyAccessToken(accessToken);
                if (!decoded || !decoded.userId) {
                    throw new AppError('UserId missing in access token', HttpStatusCode.BAD_REQUEST);
                }
                userId = decoded.userId;
            } catch {
                const decodedRefresh = this.authService.verifyRefreshToken(refreshToken);
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

    async blockOrUnblockUser(req: CustomRequest, res: Response) {
        const { id } = req.params;

        const updatedUser = await this.blockUnblockUser.execute(id);

        const message = updatedUser.isBlocked ? "User blocked successfully" : "User unblocked successfully";

        ResponseHandler.success(res, message, updatedUser, HttpStatusCode.OK);
    }

    async getAllUsers(req: CustomRequest, res: Response) {
        try {
            const users = await this.getAllUsersUsecase.execute();
            ResponseHandler.success(res, 'All users fetched successfully', users, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

}
