
export const TOKENS = {
  // Repositories
  UserRepository: 'UserRepository',
  HotelRepository: 'HotelRepository',
  RoomRepository: 'RoomRepository',
  BookingRepository: 'BookingRepository',
  AmenitiesRepository: 'AmenitiesRepository',
  SubscriptionRepository: 'SubscriptionRepository',
  ChatRepository: 'ChatRepository',

  // Services
  AuthService: 'AuthService',
  MailService: 'MailService',
  RedisService: 'RedisService',
  AwsS3Service: 'AwsS3Service',
  SocketService: 'SocketService',

  // Use Cases
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
  CreateHotelUseCase: 'CreteHotelUseCase',
  UpdateHotelUseCase: 'UpdateHotelUseCase',
  GetHotelByIdUseCase: 'GetHotelByIdUseCase',
  GetAllHotelsUseCase: 'GetAllHotelsUseCase',
  CreateRoomUseCase: 'CreateRoomUseCase',
  UpdateRoomUseCase: 'UpdateRoomUseCase',
  GetRoomByIdUseCase: 'GetRoomByIdUseCase',
  GetRoomsByHotelUseCase: 'GetRoomsByHotelUseCase',
  GetAvailableRoomsByHotelUseCase: 'GetAvailableRoomsByHotelUseCase',
  GetAllRoomsUseCase: 'GetAllRoomsUseCase',

  //booking
  CreateBookingUseCase: 'CreateBookingUseCase',
  GetBookingsByHotelUseCase: 'GetBookingByHotelUseCase',
  GetBookingsByUserUseCase: 'GetBookingsByUserUseCase',
  CheckRoomAvlUseCase: 'CheckRoomAvlUseCase',
  CancelRoomUseCase: 'CancelRoomUseCase',

  //amenities UseCase
  CreateAmenityUseCase: 'CreateAmenityUseCase',
  UpdateAmenityUseCase: 'UpdateAmenityUseCase',
  GetAmenityByIdUseCase: 'GetAmenityByIdUseCase',
  GetAllAmenitiesUseCase: 'GetAllAmenitiesUseCase',
  BlockUnblockAmenityUseCase: 'BlockUnblockAmenityUseCase',
  GetActiveAmenitiesUseCase: 'GetActiveAmenitiesUseCase',

  //subscription UseCase
  CreateSubscriptionUseCase: 'CreateSubscriptionUseCase',
  UpdateSubscriptionUseCase: 'UpdateSubscriptionUseCase',
  GetActiveSubscriptionsUseCase: 'GetActiveSubscriptionsUseCase',
  GetAllSubscriptionsUseCase: 'GetAllSubscriptionsUseCase',
  BlockUnblockSubscriptionUseCase: 'BlockUnblockSubscriptionUseCase',

  //chat UseCase
  GetChatMessagesUseCase: 'GetChatMessagesUseCase',
  SendMessageUseCase: 'SendMessageUseCase',
  GetChattedUsersUseCase: 'GetChattedUsersUseCase',
};
