import { isProduction } from './config';
import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { logger, enumerateErrorFormat } from '../utils/logger';

export const errorHandler = (error: any, req: Request, res: Response, next) => {

    if (res.headersSent) {
        return next(error)
    }

    if (error.isRouteError) {

        const message: any = {}

        message.statusCode = error.statusCode;
        message.details = error.details

        if (error.clientData) {
            message.clientData = error.clientData
        }

        res.status(500).send(message)
        logRouteError(req, res, error)
        return;
    }

    // For Joi validation errors
    if (error instanceof ValidationError) {
        logRouteError(req, res, error)
        res.status(500).json({
            statusCode: 'invalid-fields',
            message: error?.message ?? 'no-message'
        })
        return
    }

    logRouteError(req, res, error)
    res.status(500).json({
        message: error?.message ?? 'no-message'
    })
}


const logRouteError = (req: Request, res: Response, error) => {

    if (!isProduction()) {
        console.log(error);
    }

    let type = 'error';

    if (error.logAsInfo) {
        type = 'info'
    }

    logger.log(type, req.originalUrl, {
        error: enumerateErrorFormat(error),
        body: req.body,
        httpRequest: {
            status: res.statusCode,
            requestUrl: req.url,
            requestMethod: req.method,
            remoteIp: req.connection.remoteAddress,
        },
    });
}
