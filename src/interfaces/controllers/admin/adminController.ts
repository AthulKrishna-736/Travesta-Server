import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../../utils/customRequest";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { TOKENS } from "../../../constants/token";
import { IBlockUnblockUser, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IUpdateVendorReqUseCase } from "../../../domain/interfaces/usecases.interface";
import { Pagination } from "../../../shared/types/common.types";
import { AppError } from "../../../utils/appError";

@injectable()
export class AdminController {
    constructor(
        @inject(TOKENS.BlockUserUseCase) private blockUnblockUser: IBlockUnblockUser,
        @inject(TOKENS.GetAllUsersUseCase) private getAllUsersUsecase: IGetAllUsersUseCase,
        @inject(TOKENS.GetAllVendorReqUseCase) private getAllVendorReqUseCase: IGetAllVendorReqUseCase,
        @inject(TOKENS.UpdateVendorReqUseCase) private updateVendorReqUseCase: IUpdateVendorReqUseCase,
    ) { }

    async blockOrUnblockUser(req: CustomRequest, res: Response) {
        const { id } = req.params;

        const updatedUser = await this.blockUnblockUser.execute(id);

        const message = updatedUser.isBlocked ? `${updatedUser.role} blocked successfully` : `${updatedUser.role} unblocked successfully`;

        ResponseHandler.success(res, message, updatedUser, HttpStatusCode.OK);
    }

    async getAllUsers(req: CustomRequest, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const role = req.query.role as 'user' | 'vendor'

            const { users, total } = await this.getAllUsersUsecase.execute(page, limit, role);
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

            const { vendors, total } = await this.getAllVendorReqUseCase.execute(page, limit)
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

            const { message } = await this.updateVendorReqUseCase.execute(vendorId, isVerified, reason)
            ResponseHandler.success(res, message, null, HttpStatusCode.OK);
        } catch (error) {
            throw error
        }
    }

}
