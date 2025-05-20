import { injectable, inject } from 'tsyringe';
import {  Response } from 'express';
import { TOKENS } from '../../../constants/token';
import { CustomRequest } from '../../../utils/customRequest';
import { HttpStatusCode } from '../../../utils/HttpStatusCodes';
import { AppError } from '../../../utils/appError';
import { ResponseHandler } from '../../../middlewares/responseHandler';

@injectable()
export class HotelController {
    constructor(
        @inject(TOKENS.CreateHotelUseCase)
        private _createHotelUseCase: ICreateHotelUseCase
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
                services
            } = req.body;

            const imageFile = req.file;

            if (!imageFile) {
                throw new AppError('Image is required', HttpStatusCode.BAD_REQUEST);
            }

            const userId = req.user?.userId; 

            const hotelData = {
                name,
                description,
                address,
                city,
                state,
                tags,
                amenities,
                services,
                imageFile,
                createdBy: userId,
            };

            const result = await this._createHotelUseCase.execute(hotelData);

            ResponseHandler.success(res, 'Hotel created successfully', result, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }
}
