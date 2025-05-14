import { Response } from "express";
import { UpdateUserDTO } from "../../dtos/user/user.dto";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";
import { IUpdateKycUseCase, IUpdateUserUseCase } from "../../../domain/interfaces/usecases.interface";

@injectable()
export class VendorController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUser: IUpdateUserUseCase,
        @inject(TOKENS.UpdateKycUseCase) private _updateKyc: IUpdateKycUseCase,
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

    async updateKyc(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User ID is missing", HttpStatusCode.BAD_REQUEST);
            }

            const files = req.files as any;

            if (!files || !files.front || !files.back) {
                throw new AppError("Both front and back KYC documents are required", HttpStatusCode.BAD_REQUEST);
            }

            const frontFile = files.front[0];
            const backFile = files.back[0];

            const vendor = await this._updateKyc.execute(userId, frontFile, backFile);

            ResponseHandler.success(res, vendor.message, vendor.vendor, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}

