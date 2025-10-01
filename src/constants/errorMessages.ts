
export enum AUTH_ERROR_MESSAGES {
    IdMissing = 'UserId is missing',
    userExist = 'User already exists',
    createFail = 'Failed to create user',
    updateFail = 'Failed to update user',
    notFound = 'User not found',
    invalidRole = 'Unauthorized: Role not permitted',
    invalidGoogle = 'Invalid Google Token',
    googleError = 'Unable to retrieve user information from Google',
    blocked = 'User is blocked',
    invalidData = 'Invalid credentials',
    invalidToken = 'Invalid token or token data',
    passError = 'New password must be different from the old password',
    emailError = 'Email is missing',
    otpError = 'Invalid or expired otp',
    verifyError = 'Otp verification failed or session expired',
    jwtMissing = 'Access or Refresh token missing in cookies',
    resendOtp = 'Userid and purpose are required',
    login = 'Email, password and role are required',
    loginGoogle = 'Google token and role are required',
    forgotPass = 'Email and role missing in body',
    updatePass = 'User email or password are required',
    notVerified = 'User is not verified. Please upload docs and verify',
    kycMissing = 'Both front and back KYC documents are required',
}

export enum HOTEL_ERROR_MESSAGES {
    nameError = 'Hotel with the same name already exists',
    createFail = 'Failed to create Hotel',
    notFound = 'No hotels found',
    updateFail = 'Failed to update Hotel',

    IdMissing = 'Hotel id is missing',
    minImages = 'At least 1 image is required to create a hotel',
    maxImages = 'You can upload a maximum of 10 images',
}

export enum ROOM_ERROR_MESSAGES {
    IdMissing = 'Room id is missing',
    createFail = 'Failed to create Room',
    updateFail = 'Failed to update Room',
    nameError = 'Room with the same name already exists',
    minImages = 'At least 1 image is required to create a room',
    maxImages = 'You can upload a maximum of 10 images',
    notFound = 'Room not found',
}

export enum AMENITIES_ERROR_MESSAGES {
    IdMissing = 'Amenity id is missing',
    blockFail = 'Failed to block/unblock amenity',
    createFail = 'Failed to create amenity',
    updateFail = 'Failed to update amenity',
    notFound = 'No amenities found',
}

export enum BOOKING_ERROR_MESSAGES {
    IdMissing = 'Booking id is missing',
    createFail = 'Failed to create booking',
    updateFail = 'Failed to update booking',
    notFound = 'No bookings found',
    invalidData = 'Missing booking fields',
}

export enum WALLET_ERROR_MESSAGES {
    IdMissing = 'Wallet id is missing',
    createFail = 'Failed to create wallet',
    updateFail = 'Failed to update wallet',
    notFound = 'Wallet not found',
    exist = 'Wallet already exist',
    Insufficient = 'Insufficient wallet balance',
}

export enum SUBSCRIPTION_ERROR_MESSAGES {
    IdMissing = 'Subscription id missing',
    createFail = 'Failed to create subscription',
    updateFail = 'Failed to update subscription',
    noPlans = 'No plans found',
    notFound = 'Cant subscribe. Plan id not found',
    notActive = 'Cant subscribe. Plan is not active',
    blockError = 'Error while block/unblock plans',
    nameError = 'Plan with same name already exists',
}

export enum TRANSACTION_ERROR_MESSAGES {
    IdMissing = 'Transaction id missing',
    notFound = 'Transaction not found',
    createFail = 'Failed to create transaction',
    updateFail = 'Failed to update transaction',
}

export enum CHAT_ERROR_MESSAGES {
    notFound = 'Sender or receiver not found',
    IdMissing = 'Curr or target user Id missing',
    access = 'Only active booking users can access chat',
}
