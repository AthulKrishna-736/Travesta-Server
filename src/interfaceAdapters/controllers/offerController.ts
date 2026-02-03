import { inject, injectable } from "tsyringe";
import { Response, NextFunction } from "express";
import { TOKENS } from "../../constants/token";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { AppError } from "../../utils/appError";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { IOfferController } from "../../domain/interfaces/controllers/offerController.interface";
import { ICreateOfferUseCase, IUpdateOfferUseCase, IGetVendorOffersUseCase, IDetectOfferForRoomUseCase, IToggleOfferStatusUseCase } from "../../domain/interfaces/model/offer.interface";
import { TCreateOfferDTO, TUpdateOfferDTO, TDetectOfferInput } from "../dtos/offer.dto";
import { CustomRequest } from "../../utils/customRequest";
import { Pagination } from "../../shared/types/common.types";

@injectable()
export class OfferController implements IOfferController {
    constructor(
        @inject(TOKENS.CreateOfferUseCase) private _createOfferUseCase: ICreateOfferUseCase,
        @inject(TOKENS.UpdateOfferUseCase) private _updateOfferUseCase: IUpdateOfferUseCase,
        @inject(TOKENS.GetVendorOffersUseCase) private _getVendorOffersUseCase: IGetVendorOffersUseCase,
        @inject(TOKENS.DetectOfferForRoomUseCase) private _detectOfferUseCase: IDetectOfferForRoomUseCase,
        @inject(TOKENS.ToggleOfferStatusUseCase) private _toggleOfferStatusUseCase: IToggleOfferStatusUseCase,
    ) { }

    async createOffer(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            if (!vendorId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { name, discountType, discountValue, hotelId, roomType, startDate, expiryDate } = req.body;

            const data: TCreateOfferDTO = {
                name,
                vendorId,
                hotelId: hotelId || null,
                discountType,
                discountValue,
                roomType,
                startDate,
                expiryDate
            };

            const { offer, message } = await this._createOfferUseCase.createOffer(data);
            ResponseHandler.success(res, message, offer, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateOffer(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { offerId } = req.params;
            if (!offerId) throw new AppError("Offer id missing", HttpStatusCode.BAD_REQUEST);

            const data: TUpdateOfferDTO = { ...req.body };

            const { offer, message } = await this._updateOfferUseCase.updateOffer(offerId, data);
            ResponseHandler.success(res, message, offer, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getVendorOffers(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            if (!vendorId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = req.query.search as string;

            const { offers, total, message } = await this._getVendorOffersUseCase.getVendorOffers(vendorId, page, limit, search);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) };
            ResponseHandler.success(res, message, offers, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async detectOfferForRoom(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = req.body as TDetectOfferInput;

            if (!input.roomType) {
                throw new AppError("roomType required", HttpStatusCode.BAD_REQUEST);
            }

            const detected = await this._detectOfferUseCase.detectOffersForRoom(input);
            ResponseHandler.success(res, "Offer detection successful", detected, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async toggleOfferStatus(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { offerId } = req.params;
            if (!offerId) throw new AppError("Offer id is missing", HttpStatusCode.BAD_REQUEST);

            const { offer, message } = await this._toggleOfferStatusUseCase.toggleOfferStatus(offerId);
            ResponseHandler.success(res, message, offer, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
