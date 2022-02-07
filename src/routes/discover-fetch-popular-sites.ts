import { fetchPopularSites } from './../utils/helpers-discover';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const scheme = Joi.object({
    totalVisits: Joi.number().optional()
})

/**
 * @api {post} api/discover-fetch-popular-sites Fetch Popular Sites
 * @apiDescription Fetch the most popular sites.
 * @apiName discoverFetchPopularSites
 * @apiGroup Discover
 * @apiParamExample {json} Request-Example:
 * {
 *     totalVisits?: number,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      sites
 * }
 */
export const discoverFetchPopularSites = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const sites = await fetchPopularSites(req.body.totalVisits)

    return res.json({
        sites
    })
};
