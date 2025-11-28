import { Types } from "mongoose";
import { TCreateCouponDTO, TResponseCouponDTO, TUpdateCouponDTO } from "../../../interfaceAdapters/dtos/coupon.dto";

export type TCouponTypes = 'flat' | 'percent';

export interface ICoupon {
    _id?: string;
    vendorId: Types.ObjectId;
    name: string;
    code: string;
    type: TCouponTypes;
    value: number;
    minPrice: number;
    maxPrice: number;
    startDate: Date;
    endDate: Date;
    count: number;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateCouponUseCase {
    createCoupon(data: TCreateCouponDTO): Promise<{ coupon: TResponseCouponDTO, message: string }>;
}

export interface IUpdateCouponUseCase {
    updateCoupon(couponId: string, data: TUpdateCouponDTO): Promise<{ coupon: TResponseCouponDTO | null, message: string }>
}

export interface IGetVendorCouponsUseCase {
    getVendorCoupons(vendorId: string, page: number, limit: number, search?: string): Promise<{ coupons: TResponseCouponDTO[], total: number, message: string }>
}

export interface IGetUserCouponsUseCase {
    getUserCoupons(vendorId: string, price: number): Promise<{ coupons: TResponseCouponDTO[], message: string }>
}

export interface IToggleCouponStatusUseCase {
    toggleCouponStatus(couponId: string): Promise<{ coupon: TResponseCouponDTO, message: string }>
}