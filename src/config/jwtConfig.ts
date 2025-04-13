export const jwtConfig = {
    accessToken: {
        expiresIn: 5,
        maxAge: 15 * 60 * 1000
    },
    refreshToken: {
        expiresIn: 30,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}
