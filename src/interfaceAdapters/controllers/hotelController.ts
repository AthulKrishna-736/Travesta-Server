import { injectable, inject } from 'tsyringe';
import { NextFunction, Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { ICreateHotelUseCase, IGetAllHotelsUseCase, IGetHotelAnalyticsUseCase, IGetHotelByIdUseCase, IGetHotelDetailWithRoomUseCase, IGetTrendingHotelsUseCase, IGetVendorHotelsUseCase, IUpdateHotelUseCase } from '../../domain/interfaces/model/hotel.interface';
import { TCreateHotelDTO, TUpdateHotelDTO } from '../dtos/hotel.dto';
import { Pagination } from '../../shared/types/common.types';
import { AUTH_ERROR_MESSAGES, HOTEL_ERROR_MESSAGES } from '../../constants/errorMessages';
import { IHotelController } from '../../domain/interfaces/controllers/hotelController.interface';

@injectable()
export class HotelController implements IHotelController {
    constructor(
        @inject(TOKENS.CreateHotelUseCase) private _createHotelUseCase: ICreateHotelUseCase,
        @inject(TOKENS.UpdateHotelUseCase) private _updateHotelUseCase: IUpdateHotelUseCase,
        @inject(TOKENS.GetHotelByIdUseCase) private _getHotelByIdUseCase: IGetHotelByIdUseCase,
        @inject(TOKENS.GetAllHotelsUseCase) private _getAllHotelsUseCase: IGetAllHotelsUseCase,
        @inject(TOKENS.GetHotelsByVendorUseCase) private _getHotelsByVendorUseCase: IGetVendorHotelsUseCase,
        @inject(TOKENS.GetHotelAnalyticsUseCase) private _getHotelAnalyticsUseCase: IGetHotelAnalyticsUseCase,
        @inject(TOKENS.GetHotelDetailsWithRoomUseCase) private _getHotelDetailsWithRoom: IGetHotelDetailWithRoomUseCase,
        @inject(TOKENS.GetTrendingHotelsUseCase) private _getTrendingHotelsUseCase: IGetTrendingHotelsUseCase,
    ) { }

    async createHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const FILES = req.files as Express.Multer.File[];
            const VENDOR_ID = req.user?.userId;

            if (!VENDOR_ID) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            if (!FILES || FILES.length === 0) {
                throw new AppError(HOTEL_ERROR_MESSAGES.minImages, HttpStatusCode.BAD_REQUEST);
            }
            if (FILES.length > 10) {
                throw new AppError(HOTEL_ERROR_MESSAGES.maxImages, HttpStatusCode.BAD_REQUEST);
            }

            const {
                name,
                description,
                address,
                city,
                state,
                geoLocation,
                tags,
                amenities,
                checkInTime,
                checkOutTime,
                minGuestAge,
                breakfastFee,
                petsAllowed,
                outsideFoodAllowed,
                idProofAccepted,
                specialNotes
            } = req.body;

            const hotelData: TCreateHotelDTO = {
                name,
                description,
                address,
                city,
                state,
                geoLocation: { type: 'Point', coordinates: JSON.parse(geoLocation) },
                tags: JSON.parse(tags),
                amenities: JSON.parse(amenities),
                images: [],
                propertyRules: {
                    checkInTime,
                    checkOutTime,
                    minGuestAge: Number(minGuestAge),
                    breakfastFee: breakfastFee ? Number(breakfastFee) : undefined,
                    petsAllowed: petsAllowed === 'true' ? true : false,
                    outsideFoodAllowed: outsideFoodAllowed === 'true' ? true : false,
                    idProofAccepted: JSON.parse(idProofAccepted),
                    specialNotes,
                }
            };

            const { hotel, message } = await this._createHotelUseCase.createHotel(VENDOR_ID, hotelData, FILES);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hotelId } = req.params;
            const FILES = req.files as Express.Multer.File[];

            if (!hotelId) {
                throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            if (FILES.length > 10) {
                throw new AppError(HOTEL_ERROR_MESSAGES.maxImages, HttpStatusCode.BAD_REQUEST);
            }

            const updateData: TUpdateHotelDTO = {};

            const {
                name,
                description,
                address,
                city,
                state,
                geoLocation,
                tags,
                amenities,
                images,
                checkInTime,
                checkOutTime,
                minGuestAge,
                breakfastFee,
                petsAllowed,
                outsideFoodAllowed,
                idProofAccepted,
                specialNotes,
            } = req.body;

            if (name) updateData.name = name;
            if (description) updateData.description = description;
            if (address) updateData.address = address;
            if (city) updateData.city = city;
            if (state) updateData.state = state;

            if (tags) updateData.tags = JSON.parse(tags);
            if (amenities) updateData.amenities = JSON.parse(amenities);
            if (images) updateData.images = JSON.parse(images);

            if (geoLocation) {
                updateData.geoLocation = { type: 'Point' };
                updateData.geoLocation.coordinates = JSON.parse(geoLocation);
            }

            // Property rules
            if (
                checkInTime ||
                checkOutTime ||
                minGuestAge ||
                breakfastFee ||
                petsAllowed ||
                outsideFoodAllowed ||
                idProofAccepted ||
                specialNotes
            ) {
                updateData.propertyRules = {};
                if (checkInTime) updateData.propertyRules.checkInTime = checkInTime;
                if (checkOutTime) updateData.propertyRules.checkOutTime = checkOutTime;
                if (minGuestAge) updateData.propertyRules.minGuestAge = Number(minGuestAge);
                if (breakfastFee) updateData.propertyRules.breakfastFee = Number(breakfastFee);
                if (petsAllowed) updateData.propertyRules.petsAllowed = petsAllowed === 'true';
                if (outsideFoodAllowed) updateData.propertyRules.outsideFoodAllowed = outsideFoodAllowed === 'true';
                if (idProofAccepted) updateData.propertyRules.idProofAccepted = JSON.parse(idProofAccepted);
                if (specialNotes) updateData.propertyRules.specialNotes = specialNotes;
            }
            const { hotel, message } = await this._updateHotelUseCase.updateHotel(hotelId, updateData, FILES);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getHotelById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hotelId } = req.params;

            if (!hotelId) {
                throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { message, hotel } = await this._getHotelByIdUseCase.getHotelById(hotelId);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllHotelsToUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const PAGE = Number(req.query.page) || 1;
            const LIMIT = Number(req.query.limit) || 10;
            const LAT = Number(req.query.lat);
            const LONG = Number(req.query.long);
            const SEARCH = req.query.search as string;
            const CHECK_IN = req.query.checkIn as string;
            const CHECK_OUT = req.query.checkOut as string;
            const ROOMS = req.query.rooms ? Number(req.query.rooms) : 0;
            const ADULTS = req.query.adults ? Number(req.query.adults) : 0;
            const CHILDREN = req.query.children ? Number(req.query.children) : 0;
            const MIN_PRICE = req.query.minPrice ? Number(req.query.minPrice) : 0;
            const MAX_PRICE = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;
            const AMENITIES = req.query.amenities ? (req.query.amenities as string).split(",") : undefined;
            const ROOM_TYPE = req.query.roomType ? (req.query.roomType as string).split(",") : undefined;
            const RATING = Number(req.query.rating) || 0;
            const SORT = req.query.sort as string;

            const GEO_LOCATION = {
                lat: LAT,
                long: LONG,
            }

            const { hotels, total, message } = await this._getAllHotelsUseCase.getAllHotel(
                PAGE,
                LIMIT,
                CHECK_IN,
                CHECK_OUT,
                ROOMS,
                ADULTS,
                CHILDREN,
                GEO_LOCATION,
                SEARCH,
                AMENITIES,
                ROOM_TYPE,
                MIN_PRICE,
                MAX_PRICE,
                RATING,
                SORT,
            );
            const meta: Pagination = { currentPage: PAGE, pageSize: LIMIT, totalData: total, totalPages: Math.ceil(total / LIMIT) };
            ResponseHandler.success(res, message, hotels, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getHotelsByVendor(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const VENDOR_ID = req.user?.userId;
            const PAGE = Number(req.query.page);
            const LIMIT = Number(req.query.limit);
            const SEARCH = req.query.search as string;

            if (!VENDOR_ID) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const { hotels, total, message } = await this._getHotelsByVendorUseCase.getVendorHotels(VENDOR_ID, PAGE, LIMIT, SEARCH);
            const meta: Pagination = { currentPage: PAGE, pageSize: LIMIT, totalData: total, totalPages: Math.ceil(total / LIMIT) };
            ResponseHandler.success(res, message, hotels, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getHotelAnalytics(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hotelId } = req.params;
            const period = req.query.period as 'week' | 'month' | 'year';

            if (!hotelId) {
                throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_GATEWAY);
            }

            const { hotel, message } = await this._getHotelAnalyticsUseCase.getHotelAnalytics(hotelId, period);
            ResponseHandler.success(res, message, hotel, HttpStatusCode.OK);
        } catch (error) {
            next(error)
        }
    }

    async getHotelDetailsWithRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hotelId, roomId } = req.params;

            const CHECK_IN = req.query.checkIn as string;
            const CHECK_OUT = req.query.checkOut as string;
            const ROOMS = Number(req.query.rooms || 1);
            const ADULTS = Number(req.query.adults || 1);
            const CHILDREN = Number(req.query.children || 0);

            if (!hotelId || !roomId) {
                throw new AppError('Hotel id or room id is missing', HttpStatusCode.BAD_REQUEST);
            }

            const { hotel, room, otherRooms, message } = await this._getHotelDetailsWithRoom.getHotelDetailWithRoom(hotelId, roomId, CHECK_IN, CHECK_OUT, ROOMS, ADULTS, CHILDREN);
            ResponseHandler.success(res, message, { hotel, room, otherRooms }, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getTrendingHotels(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const today = new Date();
            const checkIn = today.toISOString();

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const checkOut = tomorrow.toISOString();

            const { hotels, message } = await this._getTrendingHotelsUseCase.trendingHotels(checkIn, checkOut);
            ResponseHandler.success(res, message, hotels, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
