import { Request, Response } from 'express';
import * as Joi from 'joi';
import { countOfNewSites } from '../utils/helpers-admin';

const scheme = Joi.object({
    daysNAgo: Joi.number().required(),
})

/**
 * @api {post} api/admin-fetch-new-sites-count
 * @apiDescription Fetches count of the new sites
 * @apiName adminFetchNewSitesCount
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchNewSitesCount = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)
        const { rate, count } = await countOfNewSites(req.body.daysNAgo);

        return res.json({ rate, count })

    } catch (e) {
        throw e;
    }
};
