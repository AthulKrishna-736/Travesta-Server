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
                throw new AppError('Vendor ID missing', HttpStatusCode.BAD_REQUEST);
            }

            if (!files || files.length === 0) {
                throw new AppError('At least 1 image is required to create a hotel', HttpStatusCode.BAD_REQUEST);
            }
            if (files.length > 10) {
                throw new AppError('You can upload a maximum of 10 images', HttpStatusCode.BAD_REQUEST);
            }

            const { name, description, address, city, state, geoLocation, tags, amenities, rating = 0 } = req.body;
            const parsedGeoLocation = Array.isArray(geoLocation) ? geoLocation : JSON.parse(geoLocation);

            let amenitiesArray: string[] = [];
            if (amenities) {
                if (Array.isArray(amenities)) {
                    amenitiesArray = amenities.flatMap(a => a.split(',').map((s: string) => s.trim()));
                } else if (typeof amenities === 'string') {
                    const parsed = JSON.parse(amenities);
                    amenitiesArray = parsed.flatMap((a: string) => a.split(',').map(s => s.trim()));
                }
            }

            let tagsArray: string[] = [];
            if (Array.isArray(tags)) {
                tagsArray = tags.map(t => t.trim());
            } else if (typeof tags === 'string') {
                try {
                    const parsed = JSON.parse(tags);
                    if (Array.isArray(parsed)) {
                        tagsArray = parsed.map(t => t.trim());
                    }
                } catch {
                    tagsArray = tags.split(',').map(t => t.trim());
                }
            }


            const hotelData: TCreateHotelDTO = {
                vendorId: userId,
                name,
                description,
                address,
                city,
                state,
                geoLocation: parsedGeoLocation,
                tags: tagsArray,
                amenities: amenitiesArray,
                rating,
                images: []
            };

            const { hotel, message } = await this._createHotelUseCase.createHotel(hotelData, files);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            const files = req.files as Express.Multer.File[];
            if (!hotelId) {
                throw new AppError('Hotel id is missing', HttpStatusCode.BAD_REQUEST);
            }

            if (!files || files.length === 0) {
                throw new AppError('At least 1 image is required to create a hotel', HttpStatusCode.BAD_REQUEST);
            }
            if (files.length > 10) {
                throw new AppError('You can upload a maximum of 10 images', HttpStatusCode.BAD_REQUEST);
            }

            let updateData: TUpdateHotelDTO = {};

            const { name, description, address, city, state, geoLocation, tags, amenities, rating, images } = req.body;

            if (name) updateData.name = name;
            if (description) updateData.description = description;
            if (address) updateData.address = address;
            if (city) updateData.city = city;
            if (state) updateData.state = state;
            if (rating) updateData.rating = Number(rating);

            if (geoLocation) {
                updateData.geoLocation = Array.isArray(geoLocation)
                    ? geoLocation
                    : JSON.parse(geoLocation);
            }

            if (tags) {
                if (Array.isArray(tags)) {
                    updateData.tags = tags.map(t => t.trim());
                } else if (typeof tags === 'string') {
                    try {
                        const parsed = JSON.parse(tags);
                        if (Array.isArray(parsed)) {
                            updateData.tags = parsed.map(t => t.trim());
                        }
                    } catch {
                        updateData.tags = tags.split(',').map(t => t.trim());
                    }
                }
            }

            if (amenities) {
                if (Array.isArray(amenities)) {
                    updateData.amenities = amenities.flatMap(a => a.split(',').map((s: string) => s.trim()));
                } else if (typeof amenities === 'string') {
                    const parsed = JSON.parse(amenities);
                    updateData.amenities = parsed.flatMap((a: string) => a.split(',').map(s => s.trim()));
                }
            }

            if (images) {
                updateData.images = typeof images === 'string' ? JSON.parse(images) : images;
            }

            const { hotel, message } = await this._updateHotelUseCase.updateHotel(hotelId, updateData, files);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getHotelById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
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
