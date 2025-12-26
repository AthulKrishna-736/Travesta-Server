import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateCouponUseCase } from "../../../application/use-cases/coupon/createCouponUseCase";
import { UpdateCouponUseCase } from "../../../application/use-cases/coupon/updateCouponUseCase";
import { GetVendorCouponsUseCase } from "../../../application/use-cases/coupon/getVendorCouponsUseCase";
import { GetUserCouponsUseCase } from "../../../application/use-cases/coupon/getUserCouponsUseCase";
import { ToggleCouponStatusUseCase } from "../../../application/use-cases/coupon/toggleCouponStatusUseCase";

import {
    ICreateCouponUseCase,
    IGetUserCouponsUseCase,
    IGetVendorCouponsUseCase,
    IToggleCouponStatusUseCase,
    IUpdateCouponUseCase
} from "../../../domain/interfaces/model/coupon.interface";


container.register<ICreateCouponUseCase>(TOKENS.CreateCouponUseCase, {
    useClass: CreateCouponUseCase,
})

container.register<IUpdateCouponUseCase>(TOKENS.UpdateCouponUseCase, {
    useClass: UpdateCouponUseCase,
})

container.register<IGetVendorCouponsUseCase>(TOKENS.GetVendorCouponsUseCase, {
    useClass: GetVendorCouponsUseCase,
})

container.register<IGetUserCouponsUseCase>(TOKENS.GetUserCouponsUseCase, {
    useClass: GetUserCouponsUseCase,
})

container.register<IToggleCouponStatusUseCase>(TOKENS.ToggleCouponStatusUseCase, {
    useClass: ToggleCouponStatusUseCase,
})