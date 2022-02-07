import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchSitePages } from './../utils/helpers-pages';


const scheme = Joi.object({
    siteUid: Joi.string(),
    fromIso: Joi.string().isoDate(),
})

/**
 * @api {post} api/fetch-site-pages-recent-updates Fetch site pages, recent.
 * @apiDescription Fetch site pages recent updates
 * @apiName fetchSitePagesRecentUpdates
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string
 *     fromIso?: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      pages
 * }
 */
export const fetchSitePagesRecentUpdates = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const pages = await fetchSitePages(req.body.siteUid, req.body.fromIso)

    return res.json({
        pages
    })
};
