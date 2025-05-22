import { injectable, inject } from "tsyringe";
import { Response } from "express";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import {
    ICreateRoomUseCase,
    IUpdateRoomUseCase,
} from "../../../domain/interfaces/usecases.interface";
import { CreateRoomDTO, UpdateRoomDTO } from "../../dtos/vendor/hotel.dto";

@injectable()
export class RoomController {
    constructor(
        @inject(TOKENS.CreateRoomUseCase) private _createRoomUseCase: ICreateRoomUseCase,
        @inject(TOKENS.UpdateRoomUseCase) private _updateRoomUseCase: IUpdateRoomUseCase,
    ) { }

    // Create Room
    async createRoom(req: CustomRequest, res: Response): Promise<void> {
        try {
            const {
                hotelId,
                name,
                capacity,
                bedType,
                amenities,
                basePrice,
                isAvailable,
            } = req.body;

            // Files for room images, if any
            const files = req.files as Express.Multer.File[] | undefined;

            // Prepare images keys array (empty, will be set in use case)
            const images: string[] = [];

            const roomData: CreateRoomDTO = {
                hotelId,
                name,
                capacity: Number(capacity),
                bedType,
                amenities: typeof amenities === "string" ? JSON.parse(amenities) : amenities,
                basePrice: Number(basePrice),
                isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
                images,
            };

            // const result = await this._createRoomUseCase.execute(roomData, files);
            ResponseHandler.success(res, "Room created successfully", result, HttpStatusCode.CREATED);
        } catch (error) {
            throw error;
        }
    }

    // Update Room
    async updateRoom(req: CustomRequest, res: Response): Promise<void> {
        try {
            const roomId = req.params.id;

            if (!roomId) {
                throw new AppError("Room ID is required", HttpStatusCode.BAD_REQUEST);
            }

            const {
                hotelId,
                name,
                capacity,
                bedType,
                amenities,
                basePrice,
                isAvailable,
            } = req.body;

            const files = req.files as Express.Multer.File[] | undefined;

            const updateData: UpdateRoomDTO = {
                hotelId,
                name,
                capacity: capacity !== undefined ? Number(capacity) : undefined,
                bedType,
                amenities: amenities ? (typeof amenities === "string" ? JSON.parse(amenities) : amenities) : undefined,
                basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
                isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
            };

            const result = await this._updateRoomUseCase.execute(roomId, updateData, files);
            ResponseHandler.success(res, "Room updated successfully", result, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    // Get Room by ID
    async getRoomById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const roomId = req.params.id;

            if (!roomId) {
                throw new AppError("Room ID is required", HttpStatusCode.BAD_REQUEST);
            }

            const room = await this._getRoomByIdUseCase.execute(roomId);
            ResponseHandler.success(res, "Room fetched successfully", room, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    // Get all rooms by Hotel ID
    async getRoomsByHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;

            if (!hotelId) {
                throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
            }

            // const rooms = await this._getRoomsByHotelUseCase.execute(hotelId);
            // ResponseHandler.success(res, "Rooms fetched successfully", rooms, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }

    // Get available rooms by Hotel ID
    async getAvailableRoomsByHotel(req: CustomRequest, res: Response): Promise<void> {
        try {
            const hotelId = req.params.hotelId;

            if (!hotelId) {
                throw new AppError("Hotel ID is required", HttpStatusCode.BAD_REQUEST);
            }

            // const rooms = await this._getAvailableRoomsByHotelUseCase.execute(hotelId);
            // ResponseHandler.success(res, "Available rooms fetched successfully", rooms, HttpStatusCode.OK);
        } catch (error) {
            throw error;
        }
    }
}
