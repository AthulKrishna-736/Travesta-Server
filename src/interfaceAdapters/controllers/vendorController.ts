import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { IGetVendorUseCase, IUpdateKycUseCase, IUpdateUserUseCase } from "../../domain/interfaces/model/usecases.interface";
import { UpdateUserDTO } from "../dtos/user.dto";

@injectable()
export class VendorController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUser: IUpdateUserUseCase,
        @inject(TOKENS.UpdateKycUseCase) private _updateKyc: IUpdateKycUseCase,
        @inject(TOKENS.GetVendorUseCase) private _getVendor: IGetVendorUseCase,
    ) { }

    async updateProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User id is missing", HttpStatusCode.BAD_REQUEST);
            }

            const userData: UpdateUserDTO = req.body;

            const { user, message } = await this._updateUser.updateUser(userId, userData, req.file);

            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
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

            const { message, vendor } = await this._updateKyc.updateKyc(userId, frontFile, backFile);

            ResponseHandler.success(res, message, vendor, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

    async getVendor(req: CustomRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('userid missing in req body', HttpStatusCode.BAD_REQUEST);
            }
            const { message, user } = await this._getVendor.getUser(userId)

            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}

