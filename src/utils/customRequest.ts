import { Request } from 'express';
import { TRole } from '../shared/types/user.types';

export interface CustomRequest extends Request {
    user?: {
        userId: string;
        email?: string;
        role: TRole;
    } | null
}
