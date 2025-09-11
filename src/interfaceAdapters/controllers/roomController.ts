import { injectable, inject } from 'tsyringe';
import { NextFunction, Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { HttpStatusCode } from '../../constants/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { ICreateRoomUseCase, IUpdateRoomUseCase, IGetRoomByIdUseCase, IGetRoomsByHotelUseCase, IGetAllRoomsUseCase, IGetAvailableRoomsUseCase, } from '../../domain/interfaces/model/room.interface';
import { TCreateRoomDTO, TUpdateRoomDTO } from '../dtos/room.dto';
import { Pagination } from '../../shared/types/common.types';
import { ROOM_RES_MESSAGES } from '../../constants/resMessages';


@injectable()
export class RoomController {
    constructor(
        @inject(TOKENS.CreateRoomUseCase) private _createRoomUseCase: ICreateRoomUseCase,
        @inject(TOKENS.UpdateRoomUseCase) private _updateRoomUseCase: IUpdateRoomUseCase,
        @inject(TOKENS.GetRoomByIdUseCase) private _getRoomByIdUseCase: IGetRoomByIdUseCase,
        @inject(TOKENS.GetRoomsByHotelUseCase) private _getRoomsByHotelUseCase: IGetRoomsByHotelUseCase,
        @inject(TOKENS.GetAllRoomsUseCase) private _getAllRoomsUseCase: IGetAllRoomsUseCase,
        @inject(TOKENS.GetAvailableRoomsUseCase) private _getAvlRoomsUseCase: IGetAvailableRoomsUseCase,
    ) { }

    async createRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];
            const { hotelId, name, roomType, roomCount, bedType, guest, amenities, basePrice, images } = req.body;

            let amenitiesArray: string[] = []
            if (amenities) {
                if (Array.isArray(amenities)) {
                    amenitiesArray = amenities.flatMap(a => a.split(',').map((s: string) => s.trim()));
                } else if (typeof amenities === 'string') {
                    const parsed = JSON.parse(amenities);
                    amenitiesArray = parsed.flatMap((a: string) => a.split(',').map(s => s.trim()));
                }
            }

            const roomData: TCreateRoomDTO = {
                hotelId,
                name,
                roomType,
                roomCount,
                bedType,
                guest,
                amenities: amenitiesArray,
                basePrice,
                images,
            };

            if (!files || files.length === 0) {
                throw new AppError('At least 1 image is required to create a room', HttpStatusCode.BAD_REQUEST);
            }
            if (files.length > 10) {
                throw new AppError('You can upload a maximum of 10 images', HttpStatusCode.BAD_REQUEST);
            }

            const { room, message } = await this._createRoomUseCase.createRoom(roomData, files);
            ResponseHandler.success(res, message, room, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const roomId = req.params.roomId;
            if (!roomId) {
                throw new AppError('Room ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const files = req.files as Express.Multer.File[];
            const { hotelId, name, roomType, roomCount, bedType, guest, amenities, basePrice, images } = req.body;

            const updateData: TUpdateRoomDTO = {
                hotelId,
                name,
                roomType,
                roomCount: roomCount ? Number(roomCount) : undefined,
                bedType,
                guest: guest ? Number(guest) : undefined,
                amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
                basePrice: basePrice ? Number(basePrice) : undefined,
                images: typeof images == 'string' ? JSON.parse(images) : images,
            };

            const { room, message } = await this._updateRoomUseCase.updateRoom(roomId, updateData, files);
            ResponseHandler.success(res, message, room, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getRoomById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const roomId = req.params.roomId;
            if (!roomId) {
                throw new AppError('Room ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const room = await this._getRoomByIdUseCase.getRoomById(roomId);
            ResponseHandler.success(res, ROOM_RES_MESSAGES.getRoom, room, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getRoomsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            if (!hotelId) {
                throw new AppError('Hotel ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const rooms = await this._getRoomsByHotelUseCase.getRoomsByHotel(hotelId);
            ResponseHandler.success(res, ROOM_RES_MESSAGES.getAll, rooms, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAvailableRoomsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            if (!hotelId) {
                throw new AppError('Hotel ID is required', HttpStatusCode.BAD_REQUEST);
            }

            // const rooms = await this._getAvailableRoomsByHotelUseCase.getAvlRoomsByHotel(hotelId);
            // ResponseHandler.success(res, 'Available rooms fetched successfully', rooms, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllRooms(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 10
            const search = req.query.search as string

            const { rooms, message, total } = await this._getAllRoomsUseCase.getAllRooms(page, limit, search);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, rooms, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getAllAvlRooms(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.max(Number(req.query.limit) || 10, 1);

            const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

            const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : 0;
            const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : 100000;

            const amenities =
                typeof req.query.amenities === 'string' && req.query.amenities.trim().length > 0
                    ? req.query.amenities.split(',')
                    : undefined;

            const checkIn = typeof req.query.checkIn === 'string' ? req.query.checkIn : undefined;
            const checkOut = typeof req.query.checkOut === 'string' ? req.query.checkOut : undefined;
            const guests = req.query.guests;

            const { rooms, message, total } = await this._getAvlRoomsUseCase.getAvlRooms(
                page,
                limit,
                minPrice,
                maxPrice,
                amenities,
                search,
                checkIn,
                checkOut,
                guests as string
            );

            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) };
            ResponseHandler.success(res, message, rooms, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }
}
