import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { IBlockUnblockAmenityUseCase, ICreateAmenityUseCase, IGetAllAmenitiesUseCase, IGetAmenityByIdUseCase, IUpdateAmenityUseCase } from "../../domain/interfaces/model/amenities.interface";
import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";


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
            
        } catch (error) {

        }
    }

    async updateAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async blockUnblockAmenity(req: CustomRequest, res: Response): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async getAmenityById(req: CustomRequest, res: Response): Promise<void> {
        try {

        } catch (error) {

        }
    }

    async getAllAmenities(req: CustomRequest, res: Response): Promise<void> {
        try {

        } catch (error) {

        }
    }
}



