import { fetchTrendingPages } from '../utils/helpers-pages';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const scheme = Joi.object({
    siteUid: Joi.string().required(),
    totalVisits: Joi.number().optional()
})

/**
 * @api {post} api/fetch-more-trending-pages 
 * @apiDescription Fetch more trending pages via siteUid
 * @apiName fetchMoreTrendingPages
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string,
 *     totalVisits: number
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      trendingPageFromSite: <Page[]>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *      statusCode: invalid-fields | no-page
 * }
 */
export const fetchMoreTrendingPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    return res.json({
        trendingPageFromSite: (await fetchTrendingPages(req.body.siteUid, req.body.totalVisits)),
    })
};
