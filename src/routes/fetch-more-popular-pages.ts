import { fetchPopularPages } from '../utils/helpers-pages';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const scheme = Joi.object({
    siteUid: Joi.string().required(),
    totalVisits: Joi.number().optional()
})

/**
 * @api {post} api/fetch-more-popular-pages 
 * @apiDescription Fetch more popular pages via siteUid
 * @apiName fetchMorePopularPages
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string,
 *     totalVisits: number
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      popularPagesFromSite: <Page[]>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *      statusCode: invalid-fields | no-page
 * }
 */
export const fetchMorePopularPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    return res.json({
        popularPagesFromSite: (await fetchPopularPages(req.body.siteUid, req.body.totalVisits)),
    })
};
