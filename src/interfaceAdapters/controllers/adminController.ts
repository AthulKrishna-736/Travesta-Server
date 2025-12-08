import { Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockUser, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/model/usecases.interface";
import { Pagination } from "../../shared/types/common.types";
import { AppError } from "../../utils/appError";
import { ADMIN_RES_MESSAGES } from "../../constants/resMessages";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { IAdminController } from "../../domain/interfaces/controllers/adminController.interface";
import { IGetAdminAnalyticsUseCase } from "../../domain/interfaces/model/booking.interface";

@injectable()
export class AdminController implements IAdminController {
    constructor(
        @inject(TOKENS.BlockUserUseCase) private _blockUnblockUserUseCase: IBlockUnblockUser,
        @inject(TOKENS.GetAllUsersUseCase) private _getAllUsersUsecase: IGetAllUsersUseCase,
        @inject(TOKENS.GetAllVendorReqUseCase) private _getAllVendorReqUseCase: IGetAllVendorReqUseCase,
        @inject(TOKENS.UpdateVendorReqUseCase) private _updateVendorReqUseCase: IUpdateVendorReqUseCase,
        @inject(TOKENS.GetAdminAnalyticsUseCase) private _getAdminAnalyticsUseCase: IGetAdminAnalyticsUseCase,
    ) { }

    async blockOrUnblockUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { customerId } = req.params;
            if (!customerId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { user, message } = await this._blockUnblockUserUseCase.blockUnblockUser(customerId);
            ResponseHandler.success(res, message, user, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const role = req.query.role as 'user' | 'vendor'
            const search = req.query.search as string
            const sortField = req.query.sortField as string;
            const sortOrder = req.query.sortOrder as string;

            const { users, total } = await this._getAllUsersUsecase.getAllUsers(page, limit, role, search, sortField, sortOrder);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }

            ResponseHandler.success(res, ADMIN_RES_MESSAGES.users, users, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getVendorRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 10
            const search = req.query.search as string
            const sortField = req.query.sortField as string;
            const sortOrder = req.query.sortOrder as string;

            const { vendors, total } = await this._getAllVendorReqUseCase.getAllVendorReq(page, limit, search, sortField, sortOrder)
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, ADMIN_RES_MESSAGES.vendorReq, vendors, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async updateVendorReq(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { vendorId } = req.params;
            const { isVerified, reason } = req.body;
            if (!vendorId || typeof isVerified !== 'boolean') {
                throw new AppError(AUTH_ERROR_MESSAGES.invalidData, HttpStatusCode.BAD_REQUEST);
            }

            const { message } = await this._updateVendorReqUseCase.updateVendorReq(vendorId, isVerified, reason)
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAdminAnalytics(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { data, message } = await this._getAdminAnalyticsUseCase.getAnalytics();
            ResponseHandler.success(res, message, data, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

}
