import { inject, injectable } from "tsyringe";
import { Response, NextFunction } from "express";
import { TOKENS } from "../../constants/token";
import { ResponseHandler } from "../../middlewares/responseHandler";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { AppError } from "../../utils/appError";
import { ICouponController } from "../../domain/interfaces/controllers/couponController.interface";
import { TCreateCouponDTO, TUpdateCouponDTO } from "../dtos/coupon.dto";
import { ICreateCouponUseCase, IGetUserCouponsUseCase, IGetVendorCouponsUseCase, IToggleCouponStatusUseCase, IUpdateCouponUseCase } from "../../domain/interfaces/model/coupon.interface";
import { CustomRequest } from "../../utils/customRequest";
import { AUTH_ERROR_MESSAGES } from "../../constants/errorMessages";
import { Pagination } from "../../shared/types/common.types";

@injectable()
export class CouponController implements ICouponController {
    constructor(
        @inject(TOKENS.CreateCouponUseCase) private _createCouponUseCase: ICreateCouponUseCase,
        @inject(TOKENS.UpdateCouponUseCase) private _updateCouponUseCase: IUpdateCouponUseCase,
        @inject(TOKENS.GetVendorCouponsUseCase) private _getVendorCouponsUseCase: IGetVendorCouponsUseCase,
        @inject(TOKENS.GetUserCouponsUseCase) private _getUserCouponsUseCase: IGetUserCouponsUseCase,
        @inject(TOKENS.ToggleCouponStatusUseCase) private _toggleCouponStatus: IToggleCouponStatusUseCase,
    ) { }

    async createCoupon(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            if (!vendorId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);
            const { name, code, type, value, minPrice, maxPrice, startDate, endDate } = req.body;

            if (type === "percent") {
                if (value > 50) {
                    throw new AppError("Percent discount cannot exceed 50%", HttpStatusCode.BAD_REQUEST);
                }
            }

            if (type === "flat") {
                if (!maxPrice) {
                    throw new AppError("Max price is required for flat discount", HttpStatusCode.BAD_REQUEST);
                }

                const maxAllowedFlat = maxPrice * 0.3;
                if (value > maxAllowedFlat) {
                    throw new AppError(`Flat discount cannot exceed 30% of max price (Max: ${maxAllowedFlat})`, HttpStatusCode.BAD_REQUEST);
                }
            }

            const data: TCreateCouponDTO = {
                ...req.body,
                vendorId: vendorId,
            };

            const { coupon, message } = await this._createCouponUseCase.createCoupon(data);
            ResponseHandler.success(res, message, coupon, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateCoupon(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { couponId } = req.params;
            if (!couponId) throw new AppError('Coupon id is missing', HttpStatusCode.BAD_REQUEST);

            const { type, value, maxPrice } = req.body;

            if (type === "percent") {
                if (value > 50) {
                    throw new AppError("Percent discount cannot exceed 50%", HttpStatusCode.BAD_REQUEST);
                }
            }

            if (type === "flat") {
                if (!maxPrice) {
                    throw new AppError("Max price is required for flat discount", HttpStatusCode.BAD_REQUEST);
                }

                const maxAllowedFlat = maxPrice * 0.3;
                if (value > maxAllowedFlat) {
                    throw new AppError(`Flat discount cannot exceed 30% of max price (Max: ${maxAllowedFlat})`, HttpStatusCode.BAD_REQUEST);
                }
            }

            const data: TUpdateCouponDTO = { ...req.body };

            const { coupon, message } = await this._updateCouponUseCase.updateCoupon(couponId, data);
            ResponseHandler.success(res, message, coupon, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async getVendorCoupons(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendorId = req.user?.userId;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = req.query.search as string;
            if (!vendorId) throw new AppError(AUTH_ERROR_MESSAGES.IdMissing, HttpStatusCode.BAD_REQUEST);

            const { coupons, message, total } = await this._getVendorCouponsUseCase.getVendorCoupons(vendorId, page, limit, search);
            const meta: Pagination = { currentPage: page, pageSize: limit, totalData: total, totalPages: Math.ceil(total / limit) }
            ResponseHandler.success(res, message, coupons, HttpStatusCode.OK, meta);
        } catch (error) {
            next(error);
        }
    }

    async getUserCoupons(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { vendorId } = req.params;

            const price = Number(req.query.price);
            if (!price) {
                throw new AppError("Price required", HttpStatusCode.BAD_REQUEST);
            }

            const { coupons, message } = await this._getUserCouponsUseCase.getUserCoupons(vendorId, price);
            ResponseHandler.success(res, message, coupons, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async toggleCouponStatus(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { couponId } = req.params;
            if (!couponId) throw new AppError('Coupon id is missing', HttpStatusCode.BAD_REQUEST);

            const { coupon, message } = await this._toggleCouponStatus.toggleCouponStatus(couponId);
            ResponseHandler.success(res, message, coupon, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
