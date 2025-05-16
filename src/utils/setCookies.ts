import { Response } from 'express';
import { env } from '../infrastructure/config/env';
import { jwtConfig } from '../infrastructure/config/jwtConfig';

export const setAccessCookie = (accessToken: string, res: Response) => {
    return res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV == 'production',
        sameSite: 'strict',
        maxAge: jwtConfig.accessToken.maxAge
    })
}

export const setRefreshCookie = (refreshToken: string, res: Response) => {
    return res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV == 'production',
        sameSite: 'strict',
        maxAge: jwtConfig.refreshToken.maxAge
    })
}