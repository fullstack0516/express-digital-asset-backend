import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchNewUsers } from '../utils/helpers-admin';

const scheme = Joi.object({
    fromIso: Joi.string().isoDate().required(),
})

/**
 * @api {post} api/admin-fetch-new-users
 * @apiDescription Fetches the new users
 * @apiName adminFetchNewUsers
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchNewUsers = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)
        const users = await fetchNewUsers(req.body.fromIso);

        return res.json({ users })

    } catch (e) {
        throw e;
    }
};
