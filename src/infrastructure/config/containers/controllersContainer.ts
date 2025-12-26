import { AuthController } from "../../../interfaceAdapters/controllers/authController";
import { UserController } from "../../../interfaceAdapters/controllers/userController";
import { VendorController } from "../../../interfaceAdapters/controllers/vendorController";
import { AdminController } from "../../../interfaceAdapters/controllers/adminController";
import { HotelController } from "../../../interfaceAdapters/controllers/hotelController";
import { RoomController } from "../../../interfaceAdapters/controllers/roomController";
import { BookingController } from "../../../interfaceAdapters/controllers/bookingController";
import { WalletController } from "../../../interfaceAdapters/controllers/walletController";
import { ChatController } from "../../../interfaceAdapters/controllers/chatController";
import { AmenityController } from "../../../interfaceAdapters/controllers/amenityController";
import { RatingController } from "../../../interfaceAdapters/controllers/ratingController";
import { CouponController } from "../../../interfaceAdapters/controllers/couponController";
import { OfferController } from "../../../interfaceAdapters/controllers/offerController";
import { SubscriptionController } from "../../../interfaceAdapters/controllers/subscriptionController";
import { NotificationController } from "../../../interfaceAdapters/controllers/notificationController";

import { IAuthController } from "../../../domain/interfaces/controllers/authController.interface";
import { IUserController } from "../../../domain/interfaces/controllers/userController.interface";
import { IVendorController } from "../../../domain/interfaces/controllers/vendorController.interface";
import { IAdminController } from "../../../domain/interfaces/controllers/adminController.interface";
import { IHotelController } from "../../../domain/interfaces/controllers/hotelController.interface";
import { IRoomController } from "../../../domain/interfaces/controllers/roomController.interface";
import { IBookingController } from "../../../domain/interfaces/controllers/bookingController.interface";
import { IWalletController } from "../../../domain/interfaces/controllers/walletController.interface";
import { IChatController } from "../../../domain/interfaces/controllers/chatController.interface";
import { IAmenityController } from "../../../domain/interfaces/controllers/amenityController.interface";
import { IRatingController } from "../../../domain/interfaces/controllers/ratingController.interface";
import { ICouponController } from "../../../domain/interfaces/controllers/couponController.interface";
import { IOfferController } from "../../../domain/interfaces/controllers/offerController.interface";
import { INotificationController } from "../../../domain/interfaces/controllers/notificationController.interface";
import { TOKENS } from "../../../constants/token";
import { container } from "tsyringe";


container.register<IAuthController>(TOKENS.AuthController, {
    useClass: AuthController,
});

container.register<IUserController>(TOKENS.UserController, {
    useClass: UserController,
});

container.register<IVendorController>(TOKENS.VendorController, {
    useClass: VendorController,
});

container.register<IAdminController>(TOKENS.AdminController, {
    useClass: AdminController,
});

container.register<IHotelController>(TOKENS.HotelController, {
    useClass: HotelController,
});

container.register<IRoomController>(TOKENS.RoomController, {
    useClass: RoomController,
});

container.register<IBookingController>(TOKENS.BookingController, {
    useClass: BookingController,
});

container.register<IWalletController>(TOKENS.WalletController, {
    useClass: WalletController,
});

container.register<IChatController>(TOKENS.ChatController, {
    useClass: ChatController,
});

container.register<IAmenityController>(TOKENS.AmenityController, {
    useClass: AmenityController,
});

container.register<SubscriptionController>(TOKENS.SubscriptionController, {
    useClass: SubscriptionController,
});

container.register<IRatingController>(TOKENS.RatingController, {
    useClass: RatingController,
})

container.register<ICouponController>(TOKENS.CouponController, {
    useClass: CouponController,
})

container.register<IOfferController>(TOKENS.OfferController, {
    useClass: OfferController,
})

container.register<INotificationController>(TOKENS.NotificationController, {
    useClass: NotificationController,
})