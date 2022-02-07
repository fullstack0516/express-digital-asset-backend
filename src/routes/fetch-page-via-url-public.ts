import { fetchNewPages, fetchPopularPages, fetchTrendingPages } from './../utils/helpers-pages';
import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchPageViaUrl as fetchPageViaUrlF } from '../utils/helpers-pages'
import { RouteError } from '../utils/route-error';

const scheme = Joi.object({
    url: Joi.string(),
})

/**
 * @api {post} api/fetch-page-via-url-public Fetch Page Via Public Url
 * @apiDescription Fetches the page for visitors.
 * @apiName fetchPagePublic
 * @apiGroup PublicPages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     url: [site-url/page-url] as string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>,
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
export const fetchPageViaUrlPublic = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const urls = req.body.url.split('/')
    if (urls.length !== 2) {
        throw new RouteError('Invalid fields, url incorrect', 'The endpoint requires a page and site url, like some-site/some-page')
    }

    const page = await fetchPageViaUrlF(urls[0], urls[1])

    delete page.contentDraftSections;

    return res.json({
        page,
        newPagesFromSite: (await fetchNewPages(page.siteUid)),
        popularPagesFromSite: (await fetchPopularPages(page.siteUid)),
        trendingPageFromSite: (await fetchTrendingPages(page.siteUid)),
    })
};
