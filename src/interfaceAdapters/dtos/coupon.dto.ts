import { TCouponTypes } from "../../domain/interfaces/model/coupon.interface";

export type TCreateCouponDTO = {
    vendorId: string;
    name: string;
    code: string;
    type: TCouponTypes;
    value: number;
    minPrice: number;
    maxPrice: number;
    startDate: string;
    endDate: string;
    count: number;
};

export type TUpdateCouponDTO = {
    vendorId?: string;
    name?: string;
    code?: string;
    type?: TCouponTypes;
    value?: number;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
    count?: number;
    isBlocked?: boolean;
};

export type TResponseCouponDTO = {
    id: string;
    vendorId: string;
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
};
