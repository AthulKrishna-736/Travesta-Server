import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../utils/customRequest";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockUser, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/usecases.interface";
import { Pagination } from "../../shared/types/common.types";
import { AppError } from "../../utils/appError";

@injectable()
export class AdminController {
    constructor(
        @inject(TOKENS.BlockUserUseCase) private _blockUnblockUser: IBlockUnblockUser,
        @inject(TOKENS.GetAllUsersUseCase) private _getAllUsersUsecase: IGetAllUsersUseCase,
        @inject(TOKENS.GetAllVendorReqUseCase) private _getAllVendorReqUseCase: IGetAllVendorReqUseCase,
        @inject(TOKENS.UpdateVendorReqUseCase) private _updateVendorReqUseCase: IUpdateVendorReqUseCase,
    ) { }

    async blockOrUnblockUser(req: CustomRequest, res: Response) {
        const { id } = req.params;

        const updatedUser = await this._blockUnblockUser.blockUnblockUser(id);

        const message = updatedUser.isBlocked ? `${updatedUser.role} blocked successfully` : `${updatedUser.role} unblocked successfully`;

        ResponseHandler.success(res, message, updatedUser, HttpStatusCode.OK);
    }

    async getAllUsers(req: CustomRequest, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const role = req.query.role as 'user' | 'vendor'
            const search = req.query.search as string

            const { users, total } = await this._getAllUsersUsecase.getAllUsers(page, limit, role, search);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, 'All users fetched successfully', users, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

    async getVendorRequest(req: CustomRequest, res: Response) {
        try {
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 10
            const search = req.query.search as string

            const { vendors, total } = await this._getAllVendorReqUseCase.getAllVendorReq(page, limit, search)
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, 'Vendor requests fetched successfully', vendors, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error
        }
    }

    async updateVendorReq(req: CustomRequest, res: Response) {
        try {
            const { vendorId } = req.params;
            const { isVerified, reason } = req.body;

            if (!vendorId || typeof isVerified !== 'boolean') {
                throw new AppError('Invalid request data', HttpStatusCode.BAD_REQUEST);
            }

            const { message } = await this._updateVendorReqUseCase.updateVendorReq(vendorId, isVerified, reason)
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}
