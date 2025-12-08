import { NextFunction, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { CustomRequest } from "../../utils/customRequest";
import { IGetVendorUseCase, IUpdateKycUseCase, IUpdateUserUseCase } from "../../domain/interfaces/model/usecases.interface";
import { TUpdateUserDTO } from "../dtos/user.dto";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { IVendorController } from "../../domain/interfaces/controllers/vendorController.interface";

@injectable()
export class VendorController implements IVendorController {
    constructor(
        @inject(TOKENS.UpdateUserUseCase) private _updateUserUseCase: IUpdateUserUseCase,
        @inject(TOKENS.UpdateKycUseCase) private _updateKycUseCase: IUpdateKycUseCase,
        @inject(TOKENS.GetVendorUseCase) private _getVendorUseCase: IGetVendorUseCase,
    ) { }

    async updateProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const userData: TUpdateUserDTO = req.body;

            const { user, message } = await this._updateUserUseCase.updateUser(userId, userData, req.file);
            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async updateKyc(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const files = req.files as any;

            if (!files || !files.front || !files.back) {
                throw new AppError(AUTH_ERROR_MESSAGES.kycMissing, HttpStatusCode.BAD_REQUEST);
            }

            const frontFile = files.front[0];
            const backFile = files.back[0];

            const { message, vendor } = await this._updateKycUseCase.updateKyc(userId, frontFile, backFile);
            ResponseHandler.success(res, message, vendor, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getVendorProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message, user } = await this._getVendorUseCase.getVendor(userId)
            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

}

