import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockAmenityUseCase, ICreateAmenityUseCase, IFindUsedActiveAmenitiesUseCase, IGetActiveAmenitiesUseCase, IGetAllAmenitiesUseCase, IGetAmenityByIdUseCase, IUpdateAmenityUseCase } from "../../domain/interfaces/model/amenities.interface";
import { CustomRequest } from "../../utils/customRequest";
import { NextFunction, Response } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { TCreateAmenityDTO, TUpdateAmenityDTO } from "../dtos/amenity.dto";
import { Pagination } from "../../shared/types/common.types";
import { AppError } from "../../utils/appError";
import { AMENITIES_ERROR_MESSAGES } from "../../constants/errorMessages";


@injectable()
export class AmenityController {
    constructor(
        @inject(TOKENS.CreateAmenityUseCase) private _createAmenityUseCase: ICreateAmenityUseCase,
        @inject(TOKENS.UpdateAmenityUseCase) private _updateAmenityUseCase: IUpdateAmenityUseCase,
        @inject(TOKENS.BlockUnblockAmenityUseCase) private _blockUnblockAmenityUseCase: IBlockUnblockAmenityUseCase,
        @inject(TOKENS.GetAmenityByIdUseCase) private _getAmenityByIdUseCase: IGetAmenityByIdUseCase,
        @inject(TOKENS.GetAllAmenitiesUseCase) private _getAllAmenitiesUseCase: IGetAllAmenitiesUseCase,
        @inject(TOKENS.GetActiveAmenitiesUseCase) private _getAllActiveAmenitiesUseCase: IGetActiveAmenitiesUseCase,
        @inject(TOKENS.FindUsedActiveAmenitiesUseCase) private _findUsedAmenitiesUseCase: IFindUsedActiveAmenitiesUseCase,
    ) { }

    async createAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, type, description } = req.body;
            const amenityData: TCreateAmenityDTO = {
                name,
                type,
                description
            };

            const { amenity, message } = await this._createAmenityUseCase.createAmenity(amenityData);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { amenityId } = req.params;
            if (!amenityId) {
                throw new AppError(AMENITIES_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const data: TUpdateAmenityDTO = req.body;
            const { amenity, message } = await this._updateAmenityUseCase.updateAmenity(amenityId, data);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async blockUnblockAmenity(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { amenityId } = req.params;
            if (!amenityId) {
                throw new AppError(AMENITIES_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { amenity, message } = await this._blockUnblockAmenityUseCase.blockUnblockAmenityUseCase(amenityId);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAmenityById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { amenityId } = req.params;
            const { amenity, message } = await this._getAmenityByIdUseCase.getAmenityById(amenityId);
            ResponseHandler.success(res, message, amenity, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllAmenities(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 8;
            const search = req.query.search as string || '';
            const type = req.query.type as string;
            const sortField = req.query.sortField as string;
            const sortOrder = req.query.sortOrder as string;

            const { amenities, message, total } = await this._getAllAmenitiesUseCase.getAllAmenitiesUseCase(page, limit, type, search, sortField, sortOrder);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, amenities, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getAllActiveAmenities(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { amenities, message, total } = await this._getAllActiveAmenitiesUseCase.getActiveAmenities();
            ResponseHandler.success(res, message, amenities, HttpStatusCode.OK, { totalData: total });
        } catch (error) {
            next(error);
        }
    }

    async getUsedActiveAmenities(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { amenities, message, total } = await this._findUsedAmenitiesUseCase.findUsedActiveAmenities();
            ResponseHandler.success(res, message, amenities, HttpStatusCode.OK, { totalData: total });
        } catch (error) {
            next(error);
        }
    }
}



