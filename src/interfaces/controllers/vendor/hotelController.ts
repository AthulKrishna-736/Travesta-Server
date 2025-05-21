import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../../constants/token';
import { CustomRequest } from '../../../utils/customRequest';
import { HttpStatusCode } from '../../../utils/HttpStatusCodes';
import { AppError } from '../../../utils/appError';
import { ResponseHandler } from '../../../middlewares/responseHandler';
import { ICreateHotelUseCase, IGetAllHotelsUseCase, IGetHotelByIdUseCase, IUpdateHotelUseCase } from '../../../domain/interfaces/usecases.interface';
import { CreateHotelDTO, UpdateHotelDTO } from '../../dtos/vendor/hotel.dto';
import { Pagination } from '../../../shared/types/common.types';

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

            console.log('re bodyL: ', files, req.body)

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
                geoLocation: Array.isArray(geoLocation) ? geoLocation : JSON.parse(geoLocation),
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

    async getHotelById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.id;

            if (!hotelId) {
                throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
            }

            const result = await this._getHotelByIdUseCae.execute(hotelId);

            ResponseHandler.success(res, result.message, result.hotel, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }


    async getAllHotels(req: CustomRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;

            const result = await this._getAllHotelsUseCase.execute(page, limit, search);

            const meta: Pagination = {
                currentPage: page,
                pageSize: limit,
                totalData: result.total,
                totalPages: Math.ceil(result.total / limit)
            };

            ResponseHandler.success(res, result.message, result.hotels, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

}
