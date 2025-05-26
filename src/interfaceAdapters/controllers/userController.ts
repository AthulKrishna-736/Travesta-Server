import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { IGetUserUseCase, IUpdateUserUseCase } from "../../domain/interfaces/model/usecases.interface";

@injectable()
export class UserController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUser: IUpdateUserUseCase,
        @inject(TOKENS.GetUserUseCase) private _getUser: IGetUserUseCase,
    ) { }

    async updateProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User id is missing", HttpStatusCode.BAD_REQUEST);
            }

            const userData: UpdateUserDTO = req.body;

            const updateUser = await this._updateUser.updateUser(userId, userData, req.file);

            ResponseHandler.success(res, "Profile updated successfully", updateUser, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User id is missing", HttpStatusCode.BAD_REQUEST);
            }
            const profileData = await this._getUser.getUser(userId);

            ResponseHandler.success(res, "Profile fetched successfully", profileData, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}