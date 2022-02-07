import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchSites } from '../utils/helpers-admin';

const scheme = Joi.object({
    pageNum: Joi.number().integer().min(1).required(),
    showCount: Joi.number().integer().min(1).required()
})

/**
 * @api {post} api/admin-fetch-sites
 * @apiDescription Fetches the sites
 * @apiName adminFetchSites
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchSites = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)
        const { totalCount, sites } = await fetchSites(req.body.pageNum, req.body.showCount);

        return res.json({ totalCount, sites })

    } catch (e) {
        throw e;
    }
};
