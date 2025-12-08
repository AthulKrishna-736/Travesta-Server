import { NextFunction, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { IGetUserUseCase, IUpdateUserUseCase } from "../../domain/interfaces/model/usecases.interface";
import { TUpdateUserDTO } from "../dtos/user.dto";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { IUserController } from "../../domain/interfaces/controllers/userController.interface";

@injectable()
export class UserController implements IUserController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUserUseCase: IUpdateUserUseCase,
        @inject(TOKENS.GetUserUseCase) private _getUserUseCase: IGetUserUseCase,
    ) { }

    async updateProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const userData: TUpdateUserDTO = req.body;

            const image = req.file;
            const { user, message } = await this._updateUserUseCase.updateUser(userId, userData, image);

            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { user, message } = await this._getUserUseCase.getUser(userId);
            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

}