import { Request, Response } from 'express';
import * as Joi from 'joi';
import { countOfNewUsers } from '../utils/helpers-admin';

const scheme = Joi.object({
    daysNAgo: Joi.number().required(),
})

/**
 * @api {post} api/admin-fetch-new-users-count
 * @apiDescription Fetches count of the new users
 * @apiName adminFetchNewUsersCount
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchNewUsersCount = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)
        const { rate, count } = await countOfNewUsers(req.body.daysNAgo);

        return res.json({ rate, count })

    } catch (e) {
        throw e;
    }
};
