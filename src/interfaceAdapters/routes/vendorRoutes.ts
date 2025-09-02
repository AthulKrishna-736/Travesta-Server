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
            .post('/auth/signup', validateRequest(createUserSchema), (req: CustomRequest, res) => this._authController.register(req, res))
            .post('/auth/login', validateRequest(loginSchema), (req: CustomRequest, res) => this._authController.login(req, res))
            .post('/auth/google-login', validateRequest(googleLoginSchema), (req: CustomRequest, res) => this._authController.loginGoogle(req, res))
            .post('/auth/verifyOtp', validateRequest(verifyOtp), (req: CustomRequest, res) => this._authController.verifyOTP(req, res))
            .post('/auth/resendOtp', validateRequest(resendOtpSchema), (req: CustomRequest, res) => this._authController.resendOtp(req, res))
            .post('/auth/forgot-password', validateRequest(forgotPassSchema), (req: CustomRequest, res) => this._authController.forgotPassword(req, res))
            .patch('/auth/reset-password', validateRequest(updatePassSchema), (req: CustomRequest, res) => this._authController.updatePassword(req, res))
            .post('/auth/logout', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res) => this._authController.logout(req, res))

        //profile
        this.router.route('/profile')
            .put(authMiddleware, authorizeRoles('vendor'), checkUserBlock, upload.single('image'), validateRequest(updateUserSchema), (req: CustomRequest, res) => this._vendorController.updateProfile(req, res))
            .get(authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res) => this._vendorController.getVendor(req, res))
            .patch(authMiddleware, authorizeRoles('vendor'), checkUserBlock, upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), (req: CustomRequest, res) => this._vendorController.updateKyc(req, res));

        //hotels
        this.router
            .post('/hotels', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(createHotelSchema), (req: CustomRequest, res) => this._hotelController.createHotel(req, res))
            .get('/rooms/by-hotel/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req: CustomRequest, res) => this._roomController.getRoomsByHotel(req, res))
            .get('/hotels/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._hotelController.getHotelById(req, res))
            .get('/hotels', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req: CustomRequest, res) => this._hotelController.getAllHotels(req, res))
            .patch('/hotels/:hotelId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(updateHotelSchema), (req: CustomRequest, res) => this._hotelController.updateHotel(req, res));

        //rooms
        this.router
            .get('/rooms', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req, res) => this._roomController.getAllRooms(req, res))
            .get('/rooms/available', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req, res) => this._roomController.getAllAvlRooms(req, res))
            .post('/rooms', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(createRoomSchema), (req, res) => this._roomController.createRoom(req, res))
            .patch('/rooms/:roomId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, upload.array('imageFile'), validateRequest(updateRoomSchema), (req, res) => this._roomController.updateRoom(req, res))
            .get('/rooms/:roomId', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req, res) => this._roomController.getRoomById(req, res))
            .get('/hotels/:hotelId/rooms', authMiddleware, authorizeRoles('admin', 'vendor', 'user'), checkUserBlock, (req, res) => this._roomController.getRoomsByHotel(req, res))
            .get('/hotels/:hotelId/rooms/available', authMiddleware, authorizeRoles('admin', 'vendor'), checkUserBlock, (req, res) => this._roomController.getAvailableRoomsByHotel(req, res));

        //amenities
        this.router
            .get('/amenities', authMiddleware, authorizeRoles("vendor"), (req: CustomRequest, res) => this._amenityController.getAllActiveAmenities(req, res));

        //chat
        this.router
            .get('/chat/vendors', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getVendorsChatWithUser(req, res))
            .get('/chat/unread', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getUnreadMsg(req, res))
            .get('/chat/:userId/messages', authMiddleware, authorizeRoles('vendor'), checkUserBlock, (req: CustomRequest, res) => this._chatController.getChatMessages(req, res))

        //booking
        this.router
            .get('/bookings', authMiddleware, authorizeRoles('vendor', 'admin'), checkUserBlock, (req, res) => this._bookingController.getBookingsToVendor(req, res));
    }
}
