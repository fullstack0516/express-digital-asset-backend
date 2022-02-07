import { fetchSiteViaUrl } from './../utils/helpers-sites';
import { fetchNewPages, fetchPopularPages, fetchTrendingPages } from '../utils/helpers-pages';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const scheme = Joi.object({
    siteUrl: Joi.string().required(),
})

/**
 * @api {post} api/fetch-site-via-url Fetch Site Via Url
 * @apiDescription Fetches the site for visitors.
 * @apiName fetchSitePublic
 * @apiGroup PublicPages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUrl: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      site: <Site>,
 *      newPagesFromSite: <Page[]>
 *      popularPagesFromSite: <Page[]>,
 *      trendingPageFromSite: <Page[]>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *      statusCode: invalid-fields | no-page
 * }
 */
export const fetchSiteViaUrlPublic = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    const site = await fetchSiteViaUrl(req.body.siteUrl)

    return res.json({
        site,
        newPagesFromSite: (await fetchNewPages(site.uid)),
        popularPagesFromSite: (await fetchPopularPages(site.uid)),
        trendingPageFromSite: (await fetchTrendingPages(site.uid)),
    })
};
