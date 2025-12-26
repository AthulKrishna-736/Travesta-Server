import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateBookingUseCase } from "../../../application/use-cases/vendor/booking/createBookingUseCase";
import { GetBookingsByUserUseCase } from "../../../application/use-cases/vendor/booking/getBookingUserUseCase";
import { CancelBookingUseCase } from "../../../application/use-cases/vendor/booking/cancelBookingUseCase";
import { GetBookingsToVendorUseCase } from "../../../application/use-cases/vendor/booking/getBookingsToVendor";

import {
    ICancelBookingUseCase,
    ICreateBookingUseCase,
    IGetBookingsByUserUseCase,
    IGetBookingsToVendorUseCase,
} from "../../../domain/interfaces/model/booking.interface";


container.register<ICreateBookingUseCase>(TOKENS.CreateBookingUseCase, {
    useClass: CreateBookingUseCase,
})

container.register<IGetBookingsByUserUseCase>(TOKENS.GetBookingsByUserUseCase, {
    useClass: GetBookingsByUserUseCase,
})

container.register<ICancelBookingUseCase>(TOKENS.CancelRoomUseCase, {
    useClass: CancelBookingUseCase,
})

container.register<IGetBookingsToVendorUseCase>(TOKENS.GetBookingsToVendorUseCase, {
    useClass: GetBookingsToVendorUseCase,
})