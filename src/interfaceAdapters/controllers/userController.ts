import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { IGetUserUseCase, IUpdateUserUseCase } from "../../domain/interfaces/model/usecases.interface";
import { UpdateUserDTO } from "../dtos/user.dto";
import { mapUserToResponseDTO } from "../../utils/responseMapper";

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

            const image = req.file;
            const { user, message } = await this._updateUser.updateUser(userId, userData, image);

            const mappedUser = mapUserToResponseDTO(user)

            ResponseHandler.success(res, message, mappedUser, HttpStatusCode.OK);
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
            const { user, message } = await this._getUser.getUser(userId);

            const mappedUser = mapUserToResponseDTO(user)

            ResponseHandler.success(res, message, mappedUser, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}