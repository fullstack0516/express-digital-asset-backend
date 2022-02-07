import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchPageViaUrl as fetchPageViaUrlF } from '../utils/helpers-pages'
import { RouteError } from '../utils/route-error';
import { fetchNewPages, fetchPopularPages, fetchTrendingPages } from './../utils/helpers-pages';

const scheme = Joi.object({
    url: Joi.string(),
})

/**
 * @api {post} api/fetch-page-via-url Fetch Page Via Url
 * @apiDescription Fetches page
 * @apiName fetchPage
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     url: [site-url/page-url] as string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *     page: <Page>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *   statusCode: invalid-fields | no-page
 * }
 */
export const fetchPageViaUrl = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const urls = req.body.url.split('/')
    if (urls.length !== 2) {
        throw new RouteError('Invalid fields, url incorrect','The endpoint requires a page and site url, like some-site/some-page')
    }

    const page = await fetchPageViaUrlF(urls[0], urls[1])
    return res.json({
        page,
        newPagesFromSite: (await fetchNewPages(page.siteUid)),
        popularPagesFromSite: (await fetchPopularPages(page.siteUid)),
        trendingPageFromSite: (await fetchTrendingPages(page.siteUid)),
    })
};
