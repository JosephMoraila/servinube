import { Response } from 'express';

interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    maxAge: number;
    path: string;
}

/**
 * Sets a JWT token as an HTTP-only cookie
 * @param res - Express response object
 * @param token - JWT token to be set as cookie
 */
export const setAuthCookie = (res: Response, token: string): void => {
    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
        path: '/'
    };

    res.cookie('token', token, cookieOptions);
};