import { container } from "tsyringe";
import { BaseRouter } from "./baseRouter";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, forgotPassSchema, updatePassSchema, verifyOtp, resendOtpSchema, createUserSchema, googleLoginSchema, updateUserSchema, createHotelSchema, createRoomSchema, updateRoomSchema, updateHotelSchema } from "../../shared/types/zodValidation";
import { authMiddleware } from "../../middlewares/auth";
import { CustomRequest } from "../../utils/customRequest";
import { authorizeRoles } from "../../middlewares/roleMIddleware";
import { AuthController } from "../controllers/authController";
import { checkUserBlock } from "../../middlewares/checkBlock";
import { upload } from "../../infrastructure/config/multer";
import { VendorController } from "../controllers/vendorController";
import { HotelController } from "../controllers/hotelController";
import { RoomController } from "../controllers/roomController";
import { ChatController } from "../controllers/chatController";
import { BookingController } from "../controllers/bookingController";
import { AmenityController } from "../controllers/amenityController";


export class vendorRoutes extends BaseRouter {
    private _authController: AuthController
    private _vendorController: VendorController
    private _hotelController: HotelController
    private _roomController: RoomController
    private _chatController: ChatController
    private _bookingController: BookingController
    private _amenityController: AmenityController

    constructor() {
        super();
        this._authController = container.resolve(AuthController)
        this._vendorController = container.resolve(VendorController)
        this._hotelController = container.resolve(HotelController)
        this._roomController = container.resolve(RoomController)
        this._chatController = container.resolve(ChatController)
        this._bookingController = container.resolve(BookingController)
        this._amenityController = container.resolve(AmenityController);
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
            .post('/auth/logout', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._authController.logout(req, res, next))

        //profile
        this.router.route('/profile')
            .put(authMiddleware, authorizeRoles('vendor'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res, next) => this._vendorController.updateProfile(req, res, next))
            .get(authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._vendorController.getVendor(req, res, next))
            .patch(authMiddleware, authorizeRoles('vendor'), checkUserBlock, upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), (req: CustomRequest, res, next) => this._vendorController.updateKyc(req, res, next));

        //hotels
        this.router
            .get('/hotels', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelsByVendor(req, res, next))
            .get('/hotel/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelByVendor(req, res, next))
            .get('/hotels/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._hotelController.getHotelById(req, res, next))
            .get('/rooms/by-hotel/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req: CustomRequest, res, next) => this._roomController.getRoomsByHotel(req, res, next))
            .post('/hotels', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(createHotelSchema), (req: CustomRequest, res, next) => this._hotelController.createHotel(req, res, next))
            .patch('/hotels/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(updateHotelSchema), (req: CustomRequest, res, next) => this._hotelController.updateHotel(req, res, next));

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
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res, next) => this._chatController.getChatMessages(req, res, next))

        //booking
        this.router
            .get('/bookings', authMiddleware, authorizeRoles('vendor', 'admin'), checkUserBlock, (req, res, next) => this._bookingController.getBookingsToVendor(req, res, next));
    }
}
