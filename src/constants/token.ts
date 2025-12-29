
export const TOKENS = {
  //controllers
  AuthController: 'AuthController',
  UserController: 'UserController',
  VendorController: 'VendorController',
  AdminController: 'AdminController',
  HotelController: 'HotelController',
  RoomController: 'RoomController',
  AmenityController: 'AmenityController',
  ChatController: 'ChatController',
  WalletController: 'WalletController',
  BookingController: 'BookingController',
  SubscriptionController: 'SubscriptionController',
  RatingController: 'RatingController',
  CouponController: 'CouponController',
  OfferController: 'OfferController',
  NotificationController: 'NotificationController',

  // Repositories
  UserRepository: 'UserRepository',
  HotelRepository: 'HotelRepository',
  RoomRepository: 'RoomRepository',
  BookingRepository: 'BookingRepository',
  AmenitiesRepository: 'AmenitiesRepository',
  SubscriptionRepository: 'SubscriptionRepository',
  ChatRepository: 'ChatRepository',
  WalletRepository: 'WalletRepository',
  TransactionRepository: 'TransactionRepository',
  SubscriptionHistoryRepository: 'SubscriptionHistoryRepository',
  RatingRepository: 'RatingRepository',
  CouponRepository: 'CouponRepository',
  OfferRepository: 'OfferRepository',
  NotificationRepository: 'NotificationRepository',

  // Services
  AuthService: 'AuthService',
  MailService: 'MailService',
  RedisService: 'RedisService',
  AwsS3Service: 'AwsS3Service',
  SocketService: 'SocketService',
  StripeService: 'StripeService',
  PlatformFeeService: 'PlatformFeeService',

  // Helpers
  AwsImageUploader: 'AwsImageUploader',

  //auth Use Cases
  LoginUseCase: 'LoginUseCase',
  RegisterUseCase: 'RegisterUseCase',
  ConfirmRegisterUseCase: 'ConfirmRegisterUseCase',
  GoogleLoginUseCase: 'GoogleLoginUseCase',
  ForgotPassUseCase: 'ForgotPassUseCase',
  ResetPassUseCase: 'ResetPassUseCase',
  ResendOtpUseCase: 'ResendOtpUseCase',
  VerifyOtpUseCase: 'VerifyOtpUseCase',
  LogoutUseCase: 'LogoutUseCase',

  //admin UseCases
  BlockUserUseCase: 'BlockUserUseCase',
  GetAllUsersUseCase: 'GetAllUsersUseCase',
  GetAllVendorReqUseCase: 'GetAllVendorReqUseCase',
  UpdateVendorReqUseCase: 'UpdateVendorReqUseCase',

  //user UseCases
  UpdateUserUseCase: 'UpdateUserUseCase',
  GetUserUseCase: 'GetUserUseCase',

  //vendor UseCases
  UpdateKycUseCase: 'UpdateKycUseCase',
  GetVendorUseCase: 'GetVendorUseCase',

  //hotel UseCases
  CreateHotelUseCase: 'CreteHotelUseCase',
  UpdateHotelUseCase: 'UpdateHotelUseCase',
  GetHotelByIdUseCase: 'GetHotelByIdUseCase',
  GetHotelsByVendorUseCase: 'GetHotelsByVendorUseCase',
  GetAllHotelsUseCase: 'GetAllHotelsUseCase',
  GetHotelAnalyticsUseCase: 'GetHotelAnalyticsUseCase',
  GetHotelDetailsWithRoomUseCase: 'GetHotelDetailWithRoomUseCase',
  GetTrendingHotelsUseCase: 'GetTrendingHotelsUseCase',

  //room UseCases
  CreateRoomUseCase: 'CreateRoomUseCase',
  UpdateRoomUseCase: 'UpdateRoomUseCase',
  GetRoomByIdUseCase: 'GetRoomByIdUseCase',
  GetRoomsByHotelUseCase: 'GetRoomsByHotelUseCase',
  GetAllRoomsUseCase: 'GetAllRoomsUseCase',

  //booking UseCase
  CreateBookingUseCase: 'CreateBookingUseCase',
  GetBookingsByHotelUseCase: 'GetBookingByHotelUseCase',
  GetBookingsByUserUseCase: 'GetBookingsByUserUseCase',
  CheckRoomAvlUseCase: 'CheckRoomAvlUseCase',
  CancelRoomUseCase: 'CancelRoomUseCase',
  GetBookingsToVendorUseCase: 'GetBookingsToVendorUseCase',
  GetVendorHotelAnalyticsUseCase: 'GetVendorHotelAnalyticsUseCase',
  GetAdminAnalyticsUseCase: 'GetAdminAnalyticsUseCase',

  //amenities UseCases
  CreateAmenityUseCase: 'CreateAmenityUseCase',
  UpdateAmenityUseCase: 'UpdateAmenityUseCase',
  GetAmenityByIdUseCase: 'GetAmenityByIdUseCase',
  GetAllAmenitiesUseCase: 'GetAllAmenitiesUseCase',
  BlockUnblockAmenityUseCase: 'BlockUnblockAmenityUseCase',
  GetActiveAmenitiesUseCase: 'GetActiveAmenitiesUseCase',
  FindUsedActiveAmenitiesUseCase: 'FindUsedActiveAmenitiesUseCase',

  //subscription UseCases
  CreateSubscriptionUseCase: 'CreateSubscriptionUseCase',
  UpdateSubscriptionUseCase: 'UpdateSubscriptionUseCase',
  GetActiveSubscriptionsUseCase: 'GetActiveSubscriptionsUseCase',
  GetAllSubscriptionsUseCase: 'GetAllSubscriptionsUseCase',
  BlockUnblockSubscriptionUseCase: 'BlockUnblockSubscriptionUseCase',
  SubscribePlanUseCase: 'SubscribePlanUseCase',
  GetAllPlanHistoryUseCase: 'GetAllPlanHistoryUseCase',
  GetUserActivePlanUseCase: 'GetUserActivePlanUseCase',
  CancelSubscriptionUseCase: 'CancelSubscriptionUseCase',

  //chat UseCases
  GetChatMessagesUseCase: 'GetChatMessagesUseCase',
  SendMessageUseCase: 'SendMessageUseCase',
  GetChattedUsersUseCase: 'GetChattedUsersUseCase',
  MarkMsgAsReadUseCase: 'MarkMsgAsReadUseCase',
  GetVendorsChatWithUserUseCase: 'GetVendorsChatWithUserUseCase',
  GetVendorsChatWithAdminUseCase: 'GetVendorsChatWithAdminUseCase',
  GetUserUnreadMsgUseCase: 'GetUserUnreadMsgUseCase',
  GetChatAccessUseCase: 'GetChatAccessUseCase',

  //wallet UseCases
  CreateWalletUseCase: 'CreateWalletUseCase',
  GetWalletUseCase: 'GetWalletUseCase',
  AddWalletTransactionUseCase: 'AddWalletTransactionUseCase',
  TransferUsersAmountUseCase: 'TransferUsersAmountUseCase',
  AddVendorTransactionUseCase: 'AddVendorTransactionUseCase',

  //transaction UseCases
  BookingTransactionUseCase: 'BookingTransactionUseCase',
  AddMoneyToWalletUseCase: 'AddMoneyToWalletUseCase',
  GetTransactionsUseCase: 'GetTransactionsUseCase',

  //rating UseCases
  CreateRatingUseCase: 'CreateRatingUseCase',
  UpdateRatingUseCase: 'UpdateRatingUseCase',
  GetRatingsUseCase: 'GetRatingsUseCase',

  //coupon UseCases
  CreateCouponUseCase: 'CreateCouponUseCase',
  UpdateCouponUseCase: 'UpdateCouponUseCase',
  GetVendorCouponsUseCase: 'GetVendorCouponsUseCase',
  GetUserCouponsUseCase: 'GetUserCouponsUseCase',
  ToggleCouponStatusUseCase: 'ToggleCouponStatusUseCase',

  //offer UseCases
  CreateOfferUseCase: 'CreateOfferUseCase',
  UpdateOfferUseCase: 'UpdateOfferUseCase',
  GetVendorOffersUseCase: 'GetVendorOffersUseCase',
  DetectOfferForRoomUseCase: 'DetectOfferForRoomUseCase',
  ToggleOfferStatusUseCase: 'ToggleOfferStatusUseCase',

  //notification UseCases
  CreateNotificationUseCase: 'CreateNotificationUseCase',
  GetUserNotificationsUseCase: 'GetUserNotificationsUseCase',
  GetUnreadNotificationCountUseCase: 'GetUnreadNotificationCountUseCase',
  MarkNotificationReadUseCase: 'MarkNotificationReadUseCase',
  MarkAllNotificationsReadUseCase: 'MarkAllNotificationsReadUseCase',
};
