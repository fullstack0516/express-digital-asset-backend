import { Request, Response } from 'express';
import { RouteError } from '../utils/route-error';
import { checkJwt } from '../utils/helpers-auth';
import * as Joi from 'joi';

const scheme = Joi.object({
    jwt: Joi.string().required(),
})

/**
 * @api {post} api/check-valid-token
 * @apiDescription check token is valid
 * @apiName checkValidToken
 * @apiGroup User
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     jwt: string,
 * }
 */
export const checkValidToken = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);
        await checkJwt(req.body.jwt);
        res.status(200).end();

    } catch (e) {
        throw new RouteError('invalid-token', 'This is invalid JWT token');
    }
};