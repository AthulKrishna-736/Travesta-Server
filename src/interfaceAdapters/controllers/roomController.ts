import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { TOKENS } from '../../constants/token';
import { CustomRequest } from '../../utils/customRequest';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { AppError } from '../../utils/appError';
import { ResponseHandler } from '../../middlewares/responseHandler';
import { ICreateRoomUseCase, IUpdateRoomUseCase, IGetRoomByIdUseCase, IGetRoomsByHotelUseCase, IGetAllRoomsUseCase, IGetAvailableRoomsUseCase, } from '../../domain/interfaces/model/room.interface';
import { TCreateRoomDTO, TUpdateRoomDTO } from '../dtos/room.dto';
import { Pagination } from '../../shared/types/common.types';


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

    async createRoom(req: CustomRequest, res: Response): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];

            const { hotelId, name, capacity, bedType, amenities, basePrice } = req.body;

            console.log('req body room: ', req.body);

            const roomData: TCreateRoomDTO = {
                hotelId,
                name,
                capacity: Number(capacity),
                bedType,
                amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
                basePrice: Number(basePrice),
                images: [],
            };

            console.log('room data after dto mapping: ', roomData);

            if (!files || files.length === 0) {
                throw new AppError('No images provided to create Room', HttpStatusCode.BAD_REQUEST);
            }

            if (files.length < 4) {
                throw new AppError('Exactly 4 images are required to create a Room', HttpStatusCode.BAD_REQUEST);
            }

            if (files.length > 4) {
                throw new AppError('Only 4 images are allowed — please upload exactly 4 images', HttpStatusCode.BAD_REQUEST);
            }

            console.log('files check: ', files, files.length)

            const { room, message } = await this._createRoomUseCase.createRoom(roomData, files);
            ResponseHandler.success(res, message, room, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    async updateRoom(req: CustomRequest, res: Response): Promise<void> {
        try {
            const roomId = req.params.id;
            if (!roomId) {
                throw new AppError('Room ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const files = req.files as Express.Multer.File[];

            const { hotelId, name, capacity, bedType, amenities, basePrice } = req.body;

            const updateData: TUpdateRoomDTO = {
                hotelId,
                name,
                capacity: capacity !== undefined ? Number(capacity) : undefined,
                bedType,
                amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
                basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
                images: req.body.images ? JSON.parse(req.body.images) : [],
            };

            const { room, message } = await this._updateRoomUseCase.updateRoom(roomId, updateData, files);
            ResponseHandler.success(res, message, room, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getRoomById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const roomId = req.params.id;
            if (!roomId) {
                throw new AppError('Room ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const room = await this._getRoomByIdUseCase.getRoomById(roomId);
            ResponseHandler.success(res, 'Room fetched successfully', room, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getRoomsByHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            if (!hotelId) {
                throw new AppError('Hotel ID is required', HttpStatusCode.BAD_REQUEST);
            }

            const rooms = await this._getRoomsByHotelUseCase.getRoomsByHotel(hotelId);
            ResponseHandler.success(res, 'Rooms fetched successfully', rooms, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAvailableRoomsByHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;
            if (!hotelId) {
                throw new AppError('Hotel ID is required', HttpStatusCode.BAD_REQUEST);
            }

            // const rooms = await this._getAvailableRoomsByHotelUseCase.getAvlRoomsByHotel(hotelId);
            // ResponseHandler.success(res, 'Available rooms fetched successfully', rooms, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    async getAllRooms(req: CustomRequest, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 10
            const search = req.query.search as string

            const { rooms, message, total } = await this._getAllRoomsUseCase.getAllRooms(page, limit, search);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, rooms, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

    async getAllAvlRooms(req: CustomRequest, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            const minPrice = Number(req.query.minPrice ?? 0);
            const maxPrice = Number(req.query.maxPrice ?? 100000);
            const amenities = typeof req.query.amenities === 'string' && req.query.amenities.trim().length > 0 ? req.query.amenities.split(',') : undefined;

            const { rooms, message, total } = await this._getAvlRoomsUseCase.getAvlRooms(page, limit, minPrice, maxPrice, amenities, search);

            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) };
            ResponseHandler.success(res, message, rooms, HttpStatusCode.OK, meta);
        } catch (error) {
            throw error;
        }
    }

}
