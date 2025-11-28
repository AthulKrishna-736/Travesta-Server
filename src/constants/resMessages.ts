
export const AUTH_RES_MESSAGES = {
    register: 'User registration on progress',
    login: 'Login successfull',
    googleLogin: 'Google login successful',
    resendOtp: 'OTP resent to you email',
    forgotPass: 'Otp sent successfully',
    verifyOtp: 'Otp verified successfully',
    logout: 'Logged out successfully',
    resetPass: 'Password updated successfully',
    otp: 'OTP sent to email. Please verify to complete registration',
    update: 'User updated successfully',
}

export const VENDOR_RES_MESSAGES = {
    profile: 'Profile fetched successfully',
    kyc: 'KYC documents updated successfully',
}

export const ADMIN_RES_MESSAGES = {
    users: 'All users fetched successfully',
    vendorReq: 'Vendor requests fetched successfully',
    block: 'blocked successfully',
    unblock: 'unblocked successfully',
    approveVendor: 'Vendor approved successfully',
    rejectVendor: 'Vendor rejected successfully',
}

export const AMENITIES_RES_MESSAGES = {
    block: 'blocked successfully',
    unblock: 'unblocked successfully',
    create: 'Amenity created successfully',
    getActive: 'Fetched active amenities successfully',
    getAll: 'Fetched amenities successfully',
    notFound: 'No amenities found. You can create one.',
    getOne: 'Fetched amenity successfully',
    getUsed: 'Fetched used active amenities successfully',
    update: 'Amenity updated successfully',
}

export const BOOKING_RES_MESSAGES = {
    create: 'Booking created successfully',
    bookingByHotel: 'Bookings by hotel fetched successfully',
    bookingByUser: 'Bookings by user fetched successfully',
    cancel: 'Booking cancelled and refund processed successfully',
    bookingByUsers: 'Fetched users booked to vendor successfully'
}

export const HOTEL_RES_MESSAGES = {
    create: 'Hotel created successfully',
    getHotels: 'Hotels fetched successfully',
    getHotelById: 'Hotel fetched successfully',
    update: 'Hotel updated successfully',
}

export const ROOM_RES_MESSAGES = {
    create: 'Room created successfully',
    getAll: 'Rooms fetched successfully',
    getAvl: 'Available rooms fetched successfully',
    update: 'Room updated successfully',
    getRoom: 'Room fetched successfully',
    customRoomDates: 'Custom room dates fetched successfully',
}

export const CHAT_RES_MESSAGES = {
    getChat: 'Fetched chat successfully',
    getUsers: 'Fetched users who chatted',
    unread: 'Fetched unread messages',
    getVendor: 'Fetched vendors who chatted',
    access: 'Chat is available for user',
}

export const PLAN_RES_MESSAGES = {
    block: 'blocked successfully',
    unblock: 'unblocked successfully',
    create: 'Subscription plan created successfully',
    active: 'Fetched Active plans successfully',
    getAll: 'Fetched all plans successfully',
    update: 'Subscription plan updated successfully',
}

export const WALLET_RES_MESSAGES = {
    create: 'Created wallet successfully',
    getWallet: 'Fetched wallet successfully',
    paymentIntent: 'Payment intent created',
    update: 'updated wallet successfully',
}

export const TRANSACTION_RES_MESSAGES = {
    create: 'Created transaction successfully',
    getTransaction: 'Fetched Transactions successfully',
}