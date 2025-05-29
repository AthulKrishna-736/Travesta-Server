import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { ICreateHotelUseCase, IGetAllHotelsUseCase, IGetHotelByIdUseCase, IUpdateHotelUseCase } from '../../domain/interfaces/model/usecases.interface';
import { CreateHotelDTO, UpdateHotelDTO } from '../dtos/hotel.dto';
import { Pagination } from '../../shared/types/common.types';
import logger from '../../utils/logger';
import { mapHotelToResponseDTO } from '../../utils/responseMapper';

@injectable()
export class HotelController {
    constructor(
        @inject(TOKENS.CreateHotelUseCase) private _createHotelUseCase: ICreateHotelUseCase,
        @inject(TOKENS.UpdateHotelUseCase) private _updateHotelUseCase: IUpdateHotelUseCase,
        @inject(TOKENS.GetHotelByIdUseCase) private _getHotelByIdUseCae: IGetHotelByIdUseCase,
        @inject(TOKENS.GetAllHotelsUseCase) private _getAllHotelsUseCase: IGetAllHotelsUseCase,
    ) { }

    async createHotel(req: CustomRequest, res: Response): Promise<void> {
        try {

            const files = req.files as Express.Multer.File[];
            const userId = req.user?.userId;

            logger.info('re body create hotel: ', files, req.body);

            const { name, description, address, city, state, geoLocation, tags, amenities, services, rating = 0, isBlocked = false, } = req.body;
            const hotelData: CreateHotelDTO = { vendorId: userId!, name, description, address, city, state, geoLocation: Array.isArray(geoLocation) ? geoLocation : JSON.parse(geoLocation), tags, amenities, services, rating, isBlocked, images: [] };
            const { hotel, message } = await this._createHotelUseCase.execute(hotelData, files);

            const mappedHotel = mapHotelToResponseDTO(hotel)
            ResponseHandler.success(res, message, mappedHotel, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }


    async updateHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.id;
            const files = req.files as Express.Multer.File[];

            const updateData: UpdateHotelDTO = {
                ...req.body,
                rating: req.body.rating !== undefined ? Number(req.body.rating) : undefined,
                geoLocation: req.body.geoLocation ? JSON.parse(req.body.geoLocation) : undefined,
                isBlocked: req.body.isBlocked === 'true' || req.body.isBlocked === true ? true : undefined,
            };

            const result = await this._updateHotelUseCase.execute(hotelId, updateData, files);
            ResponseHandler.success(res, result.message, result.hotel, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }


    async getHotelById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.id;

            if (!hotelId) {
                throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
            }

            const { message, hotel } = await this._getHotelByIdUseCae.execute(hotelId);

            const mappedHotel = mapHotelToResponseDTO(hotel)

            ResponseHandler.success(res, message, mappedHotel, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }


    async getAllHotels(req: CustomRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;

            const { hotels, total, message } = await this._getAllHotelsUseCase.execute(page, 3, search);

            const meta: Pagination = {
                currentPage: page,
                pageSize: limit,
                totalData: total,
                totalPages: Math.ceil(total / limit)
            };

            ResponseHandler.success(res, message, hotels, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

}
