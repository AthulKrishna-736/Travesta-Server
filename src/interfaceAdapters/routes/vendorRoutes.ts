import { inject, injectable } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, createUserSchema, googleLoginSchema, updateUserSchema, createHotelSchema, createRoomSchema, updateRoomSchema, updateHotelSchema } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { checkUserBlock } from "../../middlewares/checkBlock";
import { upload } from "../../infrastructure/config/multer";
import { IAuthController } from "../../domain/interfaces/controllers/authController.interface";
import { IVendorController } from "../../domain/interfaces/controllers/vendorController.interface";
import { IHotelController } from "../../domain/interfaces/controllers/hotelController.interface";
import { IRoomController } from "../../domain/interfaces/controllers/roomController.interface";
import { IChatController } from "../../domain/interfaces/controllers/chatController.interface";
import { IBookingController } from "../../domain/interfaces/controllers/bookingController.interface";
import { IAmenityController } from "../../domain/interfaces/controllers/amenityController.interface";
import { TOKENS } from "../../constants/token";
import { IRatingController } from "../../domain/interfaces/controllers/ratingController.interface";

@injectable()
export class vendorRoutes extends BaseRouter {
    constructor(
        @inject(TOKENS.AuthController) private _authController: IAuthController,
        @inject(TOKENS.VendorController) private _vendorController: IVendorController,
        @inject(TOKENS.HotelController) private _hotelController: IHotelController,
        @inject(TOKENS.RoomController) private _roomController: IRoomController,
        @inject(TOKENS.ChatController) private _chatController: IChatController,
        @inject(TOKENS.BookingController) private _bookingController: IBookingController,
        @inject(TOKENS.AmenityController) private _amenityController: IAmenityController,
        @inject(TOKENS.RatingController) private _ratingController: IRatingController,
    ) {
        super();
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        //authentication
        this.router
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res, next) => this._authController.register(req, res, next))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res, next) => this._authController.login(req, res, next))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res, next) => this._authController.loginGoogle(req, res, next))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res, next) => this._authController.verifyOTP(req, res, next))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res, next) => this._authController.resendOtp(req, res, next))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res, next) => this._authController.forgotPassword(req, res, next))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res, next) => this._authController.updatePassword(req, res, next))
            .post('/auth/logout', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._authController.logout(req, res, next));

        //profile
        this.router.route('/profile')
            .put(authMiddleware, authorizeRoles('vendor'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res, next) => this._vendorController.updateProfile(req, res, next))
            .get(authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._vendorController.getVendorProfile(req, res, next))
            .patch(authMiddleware, authorizeRoles('vendor'), checkUserBlock, upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), (req: CustomRequest, res, next) => this._vendorController.updateKyc(req, res, next));

        //hotels
        this.router
            .get('/hotels', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelsByVendor(req, res, next))
            .get('/hotel/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelByVendor(req, res, next))
            .get('/hotel/:hotelId/analytics', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelAnalytics(req, res, next))
            .get('/hotels/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelById(req, res, next))
            .get('/rooms/by-hotel/:hotelId', (req: CustomRequest, res, next) => this._roomController.getRoomsByHotel(req, res, next))
            .post('/hotels', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(createHotelSchema), (req: CustomRequest, res, next) => this._hotelController.createHotel(req, res, next))
            .put('/hotels/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(updateHotelSchema), (req: CustomRequest, res, next) => this._hotelController.updateHotel(req, res, next));

        //rooms
        this.router
            .get('/rooms', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req, res, next) => this._roomController.getAllRooms(req, res, next))
            .get('/rooms/available', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req, res, next) => this._roomController.getAllAvlRooms(req, res, next))
            .post('/rooms', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(createRoomSchema), (req, res, next) => this._roomController.createRoom(req, res, next))
            .patch('/rooms/:roomId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(updateRoomSchema), (req, res, next) => this._roomController.updateRoom(req, res, next))
            .get('/rooms/:roomId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req, res, next) => this._roomController.getRoomById(req, res, next))
            .get('/hotels/:hotelId/rooms', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req, res, next) => this._roomController.getRoomsByHotel(req, res, next))
            .get('/hotels/:hotelId/rooms/available', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req, res, next) => this._roomController.getAvailableRoomsByHotel(req, res, next));

        //amenities
        this.router
            .get('/amenities', authMiddleware, authorizeRoles("vendor"), (req: CustomRequest, res, next) => this._amenityController.getAllActiveAmenities(req, res, next));

        //chat
        this.router
            .get('/chat/vendors', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getVendorsChatWithUser(req, res, next))
            .get('/chat/unread', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getUnreadMsg(req, res, next))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next));

        //booking
        this.router
            .get('/bookings', authMiddleware, authorizeRoles('vendor', 'admin'), checkUserBlock, (req, res, next) => this._bookingController.getBookingsToVendor(req, res, next))
            .get('/analytics', authMiddleware, authorizeRoles('vendor', 'admin'), checkUserBlock, (req: CustomRequest, res, next) => this._bookingController.getVendorHotelAnalytics(req, res, next))

        this.router
            .get('/ratings/:hotelId', (req: CustomRequest, res, next) => this._ratingController.getHotelRatings(req, res, next))
    }
}
