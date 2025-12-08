import { ICoupon } from "../model/coupon.interface";

export interface ICouponRepository {
    findCouponById(couponId: string): Promise<ICoupon | null>
    createCoupon(data: Partial<ICoupon>): Promise<ICoupon | null>
    updateCoupon(id: string, data: Partial<Omit<ICoupon, '_id' | 'vendorId' | 'createdAt' | 'updatedAt'>>): Promise<ICoupon | null>
    findByCode(code: string): Promise<ICoupon | null>
    getVendorCoupons(vendorId: string, page: number, limit: number, search?: string): Promise<{ coupons: ICoupon[], total: number }>
    getUserAvailableCoupons(vendorId: string, date: Date, price: number): Promise<ICoupon[]>
    toggleCouponStatus(couponId: string): Promise<ICoupon | null>
}