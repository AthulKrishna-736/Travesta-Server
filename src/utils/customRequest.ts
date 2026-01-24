import { Request } from 'express';
import { TRole } from '../shared/types/common.types';

export interface CustomRequest extends Request {
    user?: {
        userId: string;
        email?: string;
        role: TRole;
    } | null
}
