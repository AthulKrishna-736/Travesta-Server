export const jwtConfig = {
    accessToken: {
        expiresIn: 15,
        maxAge: 15 * 60 * 1000
    },
    refreshToken: {
        expiresIn: 7,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}

export const otpTimer = {
    expiresAt: 60,
}

export const awsS3Timer = {
    expiresAt: 84600, //one day milliseconds
}