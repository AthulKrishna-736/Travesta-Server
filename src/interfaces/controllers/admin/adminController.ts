import { Response } from "express";
import { inject, injectable } from "tsyringe";
import { CustomRequest } from "../../../utils/customRequest";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { TOKENS } from "../../../constants/token";
import { IBlockUnblockUser, IGetAllUsersUseCase } from "../../../domain/interfaces/usecases.interface";
import { Pagination } from "../../../shared/types/common.types";

@injectable()
export class AdminController {
    constructor(
        @inject(TOKENS.BlockUserUseCase) private blockUnblockUser: IBlockUnblockUser,
        @inject(TOKENS.GetAllUsersUseCase) private getAllUsersUsecase: IGetAllUsersUseCase,
    ) { }

    async blockOrUnblockUser(req: CustomRequest, res: Response) {
        const { id } = req.params;

        const updatedUser = await this.blockUnblockUser.execute(id);

        const message = updatedUser.isBlocked ? "User blocked successfully" : "User unblocked successfully";

        ResponseHandler.success(res, message, updatedUser, HttpStatusCode.OK);
    }

    async getAllUsers(req: CustomRequest, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const { users, total } = await this.getAllUsersUsecase.execute(page, limit);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, 'All users fetched successfully', users, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

}
