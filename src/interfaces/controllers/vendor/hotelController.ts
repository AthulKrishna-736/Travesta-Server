import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../../constants/token';
import { CustomRequest } from '../../../utils/customRequest';
import { HttpStatusCode } from '../../../utils/HttpStatusCodes';
import { AppError } from '../../../utils/appError';
import { ResponseHandler } from '../../../middlewares/responseHandler';
import { ICreateHotelUseCase, IUpdateHotelUseCase } from '../../../domain/interfaces/usecases.interface';
import { CreateHotelDTO, UpdateHotelDTO } from '../../dtos/vendor/hotel.dto';

@injectable()
export class HotelController {
    constructor(
        @inject(TOKENS.CreateHotelUseCase) private _createHotelUseCase: ICreateHotelUseCase,
        @inject(TOKENS.UpdateHotelUseCase) private _updateHotelUseCase: IUpdateHotelUseCase,
    ) { }

    async createHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const {
                name,
                description,
                address,
                city,
                state,
                tags,
                amenities,
                services,
                geoLocation,
            } = req.body;

            const files = req.files as Express.Multer.File[];
            const userId = req.user?.userId;

            const hotelData: CreateHotelDTO = {
                vendorId: userId!,
                name,
                description,
                address,
                city,
                state,
                tags,
                amenities,
                services,
                geoLocation: geoLocation ? JSON.parse(geoLocation) : undefined,
                images: [], 
            };

            const result = await this._createHotelUseCase.execute(hotelData, files);
            ResponseHandler.success(res, "Hotel created successfully", result.hotel, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }


    async updateHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.id;
            const {
                name,
                description,
                address,
                city,
                state,
                tags,
                amenities,
                services,
                rating,
                geoLocation,
                isBlocked
            } = req.body;

            const files = req.files as Express.Multer.File[];

            const updateData: UpdateHotelDTO = {
                name,
                description,
                address,
                city,
                state,
                rating: rating ? Number(rating) : undefined,
                isBlocked: isBlocked === "true" || isBlocked === true,
                geoLocation: geoLocation ? JSON.parse(geoLocation) : undefined,
                tags,
                amenities,
                services,
            };

            const result = await this._updateHotelUseCase.execute(hotelId, updateData, files);
            ResponseHandler.success(res, result.message, result.hotel, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

}
