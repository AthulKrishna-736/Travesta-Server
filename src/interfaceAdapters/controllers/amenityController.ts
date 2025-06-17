import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockAmenityUseCase, ICreateAmenityUseCase, IGetAllAmenitiesUseCase, IGetAmenityByIdUseCase, IUpdateAmenityUseCase } from "../../domain/interfaces/model/amenities.interface";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";


@injectable()
export class AmenityController {
    constructor(
        @inject(TOKENS.CreateAmenityUseCase) private _createAmenity: ICreateAmenityUseCase,
        @inject(TOKENS.UpdateAmenityUseCase) private _updateAmenity: IUpdateAmenityUseCase,
        @inject(TOKENS.BlockUnblockAmenityUseCase) private _blockUnblockAmenity: IBlockUnblockAmenityUseCase,
        @inject(TOKENS.GetAmenityByIdUseCase) private _getAmenityById: IGetAmenityByIdUseCase,
        @inject(TOKENS.GetAllAmenitiesUseCase) private _getAllAmenities: IGetAllAmenitiesUseCase,
    ) { }

    async createAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {
            const data = req.body;
            const amenity = await this._createAmenity.createAmenity(data);
            ResponseHandler.success(res, "Amenity created", amenity, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await this._updateAmenity.updateAmenity(id, data);
            ResponseHandler.success(res, result.message, result.amenity, HttpStatusCode.OK)
        } catch (error) {
            throw error;
        }
    }

    async blockUnblockAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this._blockUnblockAmenity.blockUnblockAmenityUseCase(id);
            ResponseHandler.success(res, result.message, result.amenity, HttpStatusCode.OK)
        } catch (error) {
            throw error;
        }
    }

    async getAmenityById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this._getAmenityById.getAmenityById(id);
            ResponseHandler.success(res, result.message, result.amenity, HttpStatusCode.OK)
        } catch (error) {
            throw error;
        }
    }

    async getAllAmenities(req: CustomRequest, res: Response): Promise<void> {
        try {
            const result = await this._getAllAmenities.getAllAmenitiesUseCase();
            ResponseHandler.success(res, result.message, result.amenities, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}



