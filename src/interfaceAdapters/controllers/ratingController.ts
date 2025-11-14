import { injectable, inject } from "tsyringe";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../../utils/customRequest";
import { TOKENS } from "../../constants/token";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { AppError } from "../../utils/appError";
import { ICreateRatingUseCase, IUpdateRatingUseCase, IGetRatingUseCase } from "../../domain/interfaces/model/rating.interface";
import { IRatingController } from "../../domain/interfaces/controllers/ratingController.interface";
import { TCreateRatingDTO, TUpdateRatingDTO } from "../dtos/rating.dto";
import { AUTH_ERROR_MESSAGES, HOTEL_ERROR_MESSAGES } from "../../constants/errorMessages";

@injectable()
export class RatingController implements IRatingController {
    constructor(
        @inject(TOKENS.CreateRatingUseCase) private _createRatingUseCase: ICreateRatingUseCase,
        @inject(TOKENS.UpdateRatingUseCase) private _updateRatingUseCase: IUpdateRatingUseCase,
        @inject(TOKENS.GetRatingsUseCase) private _getRatingsUseCase: IGetRatingUseCase,
    ) { }

    async createRating(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const FILES = req.files as Express.Multer.File[];
            const userId = req.user?.userId;

            if (!userId) {
                throw new AppError("User ID missing", HttpStatusCode.BAD_REQUEST);
            }

            const { hotelId, hospitality, cleanliness, facilities, room, moneyValue, review } = req.body;

            const ratingData: TCreateRatingDTO = {
                hotelId,
                userId,
                hospitality: Number(hospitality),
                cleanliness: Number(cleanliness),
                facilities: Number(facilities),
                room: Number(room),
                moneyValue: Number(moneyValue),
                review,
                images: FILES ? FILES.map(file => file.filename) : []
            };

            const { rating, message } = await this._createRatingUseCase.createRating(ratingData);
            ResponseHandler.success(res, message, rating, HttpStatusCode.CREATED);

        } catch (error) {
            next(error);
        }
    }

    async updateRating(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const FILES = req.files as Express.Multer.File[];
            const { ratingId, hospitality, cleanliness, facilities, room, moneyValue, review } = req.body;
            
            if (!ratingId) throw new AppError("Rating ID missing", HttpStatusCode.BAD_REQUEST);

            const updateData: TUpdateRatingDTO = {
                hospitality: hospitality ? Number(hospitality) : undefined,
                cleanliness: cleanliness ? Number(cleanliness) : undefined,
                facilities: facilities ? Number(facilities) : undefined,
                room: room ? Number(room) : undefined,
                moneyValue: moneyValue ? Number(moneyValue) : undefined,
                review,
                images: FILES ? FILES.map(file => file.filename) : undefined
            };

            const { rating, message } = await this._updateRatingUseCase.updateRating(ratingId, updateData);
            ResponseHandler.success(res, message, rating, HttpStatusCode.OK);

        } catch (error) {
            next(error);
        }
    }

    async getRatings(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { ratings, message } = await this._getRatingsUseCase.getAllRatings();
            ResponseHandler.success(res, message, ratings, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getUserRatings(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.NOT_FOUND)
            }

            const { ratings, message } = await this._getRatingsUseCase.getUserRatings(userId);
            ResponseHandler.success(res, message, ratings, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getHotelRatings(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hotelId } = req.params;
            if (!hotelId) {
                throw new AppError(HOTEL_ERROR_MESSAGES.IdMissing, HttpStatusCode.NOT_FOUND);
            }

            const { ratings, message } = await this._getRatingsUseCase.getHotelRatings(hotelId);
            ResponseHandler.success(res, message, ratings, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
