import { Request } from 'express';
import { TRole } from '../shared/types/user.types';

export interface CustomRequest extends Request {
    user?: {
        userId: string;
        role: TRole;
    } | null
}
