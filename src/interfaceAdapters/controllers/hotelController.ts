import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { ICreateHotelUseCase, IGetAllHotelsUseCase, IGetHotelByIdUseCase, IUpdateHotelUseCase } from '../../domain/interfaces/model/hotel.interface';
import { TCreateHotelDTO, TUpdateHotelDTO } from '../dtos/hotel.dto';
import { Pagination } from '../../shared/types/common.types';

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

            if (!userId) {
                throw new AppError('Vendor id missing', HttpStatusCode.BAD_REQUEST);
            }

            const { name, description, address, city, state, geoLocation, tags, amenities, services, rating = 0 } = req.body;
            const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
            const parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
            const parsedGeoLocation = Array.isArray(geoLocation) ? geoLocation : JSON.parse(geoLocation);

            if (!Array.isArray(parsedAmenities) || parsedAmenities.length === 0 || parsedAmenities.some(item => !item || item.trim() === '')) {
                throw new AppError("At least one valid amenity is required", HttpStatusCode.BAD_REQUEST);
            }

            if (!Array.isArray(parsedServices) || parsedServices.length === 0 || parsedServices.some(item => !item || item.trim() === '')) {
                throw new AppError("At least one valid service is required", HttpStatusCode.BAD_REQUEST);
            }

            if (!Array.isArray(parsedTags)) {
                throw new AppError("Tags must be a valid array", HttpStatusCode.BAD_REQUEST);
            }

            const hotelData: TCreateHotelDTO = {
                vendorId: userId!,
                name,
                description,
                address,
                city,
                state,
                geoLocation: parsedGeoLocation,
                tags: parsedTags,
                amenities: parsedAmenities,
                services: parsedServices,
                rating,
                images: []
            };
            console.log('hotel data: ', hotelData);

            if (!files || files.length === 0) {
                throw new AppError('No images provided to create Hotel', HttpStatusCode.BAD_REQUEST);
            }

            if (files.length < 4) {
                throw new AppError('Exactly 4 images are required to create a Hotel', HttpStatusCode.BAD_REQUEST);
            }

            if (files.length > 4) {
                throw new AppError('Only 4 images are allowed — please upload exactly 4 images', HttpStatusCode.BAD_REQUEST);
            }
            console.log('files : ', files, files.length);

            const { hotel, message } = await this._createHotelUseCase.createHotel(hotelData, files);

            ResponseHandler.success(res, message, hotel, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.id;
            const files = req.files as Express.Multer.File[];
            const updateData: TUpdateHotelDTO = {
                ...req.body,
                images: req.body.images ? JSON.parse(req.body.images) : [],
            };

            const { hotel, message } = await this._updateHotelUseCase.updateHotel(hotelId, updateData, files);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.OK);
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

            const { message, hotel } = await this._getHotelByIdUseCae.getHotel(hotelId);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAllHotels(req: CustomRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;

            const { hotels, total, message } = await this._getAllHotelsUseCase.getAllHotel(page, limit, search);

            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) };
            ResponseHandler.success(res, message, hotels, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

}
