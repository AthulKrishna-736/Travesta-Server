import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockAmenityUseCase, ICreateAmenityUseCase, IGetActiveAmenitiesUseCase, IGetAllAmenitiesUseCase, IGetAmenityByIdUseCase, IUpdateAmenityUseCase } from "../../domain/interfaces/model/amenities.interface";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { TCreateAmenityDTO, TUpdateAmenityDTO } from "../dtos/amenity.dto";
import { Pagination } from "../../shared/types/common.types";


@injectable()
export class AmenityController {
    constructor(
        @inject(TOKENS.CreateAmenityUseCase) private _createAmenity: ICreateAmenityUseCase,
        @inject(TOKENS.UpdateAmenityUseCase) private _updateAmenity: IUpdateAmenityUseCase,
        @inject(TOKENS.BlockUnblockAmenityUseCase) private _blockUnblockAmenity: IBlockUnblockAmenityUseCase,
        @inject(TOKENS.GetAmenityByIdUseCase) private _getAmenityById: IGetAmenityByIdUseCase,
        @inject(TOKENS.GetAllAmenitiesUseCase) private _getAllAmenities: IGetAllAmenitiesUseCase,
        @inject(TOKENS.GetActiveAmenitiesUseCase) private _getAllActiveAmenities: IGetActiveAmenitiesUseCase,
    ) { }

    async createAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {
            const data: TCreateAmenityDTO = req.body;
            const { amenity, message } = await this._createAmenity.createAmenity(data);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const data: TUpdateAmenityDTO = req.body;
            const { amenity, message } = await this._updateAmenity.updateAmenity(id, data);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async blockUnblockAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const { amenity, message } = await this._blockUnblockAmenity.blockUnblockAmenityUseCase(id);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAmenityById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const { amenity, message } = await this._getAmenityById.getAmenityById(id);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAllAmenities(req: CustomRequest, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 8;
            const search = req.query.search as string || '';
            const { amenities, message, total } = await this._getAllAmenities.getAllAmenitiesUseCase(page, limit, search);

            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, amenities, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

    async getAllActiveAmenities(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { amenities, message, total } = await this._getAllActiveAmenities.getActiveAmenities();

            ResponseHandler.success(res, message, amenities, HttpStatusCode.OK, { totalData: total });
        } catch (error) {
            throw error;
        }
    }
}



