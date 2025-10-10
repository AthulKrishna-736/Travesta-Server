
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

  // Services
  AuthService: 'AuthService',
  MailService: 'MailService',
  RedisService: 'RedisService',
  AwsS3Service: 'AwsS3Service',
  SocketService: 'SocketService',
  StripeService: 'StripeService',

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

  //room UseCases
  CreateRoomUseCase: 'CreateRoomUseCase',
  UpdateRoomUseCase: 'UpdateRoomUseCase',
  GetRoomByIdUseCase: 'GetRoomByIdUseCase',
  GetRoomsByHotelUseCase: 'GetRoomsByHotelUseCase',
  GetAvailableRoomsUseCase: 'GetAvailableRoomsUseCase',
  GetAllRoomsUseCase: 'GetAllRoomsUseCase',
  GetCustomRoomDatesUseCase: 'GetCustomRoomDatesUseCase',

  //booking UseCase
  CreateBookingUseCase: 'CreateBookingUseCase',
  GetBookingsByHotelUseCase: 'GetBookingByHotelUseCase',
  GetBookingsByUserUseCase: 'GetBookingsByUserUseCase',
  CheckRoomAvlUseCase: 'CheckRoomAvlUseCase',
  CancelRoomUseCase: 'CancelRoomUseCase',
  GetBookingsToVendorUseCase: 'GetBookingsToVendorUseCase',

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

};
