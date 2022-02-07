import { fetchSubscribedSitesNewPages } from './../utils/helpers-sites';
import { Request, Response } from 'express';
import * as Joi from 'joi';


const scheme = Joi.object({
})

/**
 * @api {post} api/api/discover-fetch-subscribed-new-pages Fetch New pages subscribed sites
 * @apiDescription Fetch the most new pages that the user is subscribred too
 * @apiName discoverFetchNewPages
 * @apiGroup Discover
 * @apiParamExample {json} Request-Example:
 * {
 *     category?: string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      pages
 * }
 */
export const discoverFetchSubscribedNewPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const pages = await fetchSubscribedSitesNewPages(req.user.uid)

    return res.json({
        pages
    })
};
