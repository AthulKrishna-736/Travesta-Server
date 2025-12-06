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
import { AUTH_ERROR_MESSAGES, HOTEL_ERROR_MESSAGES, ROOM_ERROR_MESSAGES } from '../../constants/errorMessages';
import { IRoomController } from '../../domain/interfaces/controllers/roomController.interface';


@injectable()
export class RoomController implements IRoomController {
    constructor(
        @inject(TOKENS.CreateRoomUseCase) private _createRoomUseCase: ICreateRoomUseCase,
        @inject(TOKENS.UpdateRoomUseCase) private _updateRoomUseCase: IUpdateRoomUseCase,
        @inject(TOKENS.GetRoomByIdUseCase) private _getRoomByIdUseCase: IGetRoomByIdUseCase,
        @inject(TOKENS.GetRoomsByHotelUseCase) private _getRoomsByHotelUseCase: IGetRoomsByHotelUseCase,
        @inject(TOKENS.GetAllRoomsUseCase) private _getAllRoomsUseCase: IGetAllRoomsUseCase,
    ) { }

    async createRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const FILES = req.files as Express.Multer.File[];
            const { hotelId, name, roomType, roomCount, bedType, guest, amenities, basePrice, images } = req.body;

            const roomData: TCreateRoomDTO = {
                hotelId,
                name,
                roomType,
                roomCount,
                bedType,
                guest,
                amenities: JSON.parse(amenities),
                basePrice,
                images,
            };

            if (!FILES || FILES.length === 0) {
                throw new AppError(ROOM_ERROR_MESSAGES.minImages, HttpStatusCode.BAD_REQUEST);
            }
            if (FILES.length > 10) {
                throw new AppError(ROOM_ERROR_MESSAGES.maxImages, HttpStatusCode.BAD_REQUEST);
            }

            const { room, message } = await this._createRoomUseCase.createRoom(roomData, FILES);
            ResponseHandler.success(res, message, room, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const ROOM_ID = req.params.roomId;
            if (!ROOM_ID) {
                throw new AppError(ROOM_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const FILES = req.files as Express.Multer.File[];
            const { hotelId, name, roomType, roomCount, bedType, guest, amenities, basePrice, images } = req.body;

            const updateData: TUpdateRoomDTO = {
                hotelId,
                name,
                roomType,
                roomCount: roomCount ? Number(roomCount) : undefined,
                bedType,
                guest: guest ? Number(guest) : undefined,
                amenities: JSON.parse(amenities),
                basePrice: basePrice ? Number(basePrice) : undefined,
                images: images ? JSON.parse(images) : [],
            };

            const { room, message } = await this._updateRoomUseCase.updateRoom(ROOM_ID, updateData, FILES);
            ResponseHandler.success(res, message, room, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getRoomById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const ROOM_ID = req.params.roomId;
            if (!ROOM_ID) {
                throw new AppError(ROOM_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            const room = await this._getRoomByIdUseCase.getRoomById(ROOM_ID);
            ResponseHandler.success(res, ROOM_RES_MESSAGES.getRoom, room, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getRoomsByHotel(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const HOTEL_ID = req.params.hotelId;
            const CHECK_IN = req.query.checkIn as string;
            const CHECK_OUT = req.query.checkOut as string;
            const ROOM_COUNT = Number(req.query.rooms) || 1;
            const ADULTS = Number(req.query.adults) || 1;
            const CHILDREN = Number(req.query.children) || 0;

            if (!HOTEL_ID) {
                throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            }

            if (!CHECK_IN || !CHECK_OUT) {
                throw new AppError('CheckIn or CheckOut Date missing', HttpStatusCode.BAD_REQUEST);
            }

            const rooms = await this._getRoomsByHotelUseCase.getRoomsByHotel(HOTEL_ID, CHECK_IN, CHECK_OUT, ROOM_COUNT, ADULTS, CHILDREN);
            ResponseHandler.success(res, ROOM_RES_MESSAGES.getAll, rooms, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getAllRooms(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const VENDOR_ID = req.user?.userId;
            const PAGE = Number(req.query.page) || 1;
            const LIMIT = Number(req.query.limit) || 10;
            const SEARCH = req.query.search as string;
            const HOTELID = req.query.hotelId as string;

            if (!VENDOR_ID) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_GATEWAY);
            }

            const { rooms, message, total } = await this._getAllRoomsUseCase.getAllRooms(VENDOR_ID, PAGE, LIMIT, SEARCH, HOTELID);
            const meta: Pagination = { currentPage: PAGE, pageSize: LIMIT, totalData: total, totalPages: Math.ceil(total / LIMIT) }
            ResponseHandler.success(res, message, rooms, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }
}
