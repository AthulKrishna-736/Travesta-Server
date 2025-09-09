import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { IGetUserUseCase, IUpdateUserUseCase } from "../../domain/interfaces/model/usecases.interface";
import { UpdateUserDTO } from "../dtos/user.dto";

@injectable()
export class UserController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUserUseCase: IUpdateUserUseCase,
        @inject(TOKENS.GetUserUseCase) private _getUserUseCase: IGetUserUseCase,
    ) { }

    async updateProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User id is missing", HttpStatusCode.BAD_REQUEST);
            }

            const userData: UpdateUserDTO = req.body;

            const image = req.file;
            const { user, message } = await this._updateUserUseCase.updateUser(userId, userData, image);

            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
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
            const { user, message } = await this._getUserUseCase.getUser(userId);

            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}