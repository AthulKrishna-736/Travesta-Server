import { Response } from "express";
import { UpdateUserDTO } from "../../dtos/user/user.dto";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";
import { IUpdateUserUseCase } from "../../../domain/interfaces/usecases.interface";

@injectable()
export class VendorController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUser: IUpdateUserUseCase,
    ) { }

    async updateProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User id is missing", HttpStatusCode.BAD_REQUEST);
            }

            const userData: UpdateUserDTO = req.body;

            const updateUser = await this._updateUser.execute(userId, userData, req.file);

            ResponseHandler.success(res, "Profile updated successfully", updateUser, HttpStatusCode.OK);
        } catch (error: any) {
            throw error;
        }
    }
}

