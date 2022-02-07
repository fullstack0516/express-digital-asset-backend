import { Request, Response, NextFunction } from 'express';
import { RouteError } from './../utils/route-error';


export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new RouteError('no-user', 'Theres no user detected. Requires middleware for check authentication.')
    }
    if (!req.user.isAdmin) {
        throw new RouteError('not-admin', 'The user is not admin.')
    }
    next();
};

