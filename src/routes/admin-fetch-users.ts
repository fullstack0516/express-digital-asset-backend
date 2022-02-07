import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchUsers } from '../utils/helpers-admin';

const scheme = Joi.object({
    pageNum: Joi.number().integer().min(1).required(),
    showCount: Joi.number().integer().min(1).required()
})

/**
 * @api {post} api/admin-fetch-users
 * @apiDescription Fetches the users
 * @apiName adminFetchUsers
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchUsers = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)
        const { totalCount, users } = await fetchUsers(req.body.pageNum, req.body.showCount);

        return res.json({ totalCount, users })

    } catch (e) {
        throw e;
    }
};
