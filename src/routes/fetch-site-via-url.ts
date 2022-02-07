import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchSiteViaUrl as fetchSiteViaUrlF } from '../utils/helpers-sites'

const scheme = Joi.object({
    siteUrl: Joi.string().required(),
})

/**
 * @api {post} api/fetch-site-via-url Fetch Site Via Url
 * @apiDescription Fetches site
 * @apiName fetchSite
 * @apiGroup Sites
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUrl: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      site: <Site>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *   statusCode: invalid-fields | no-site
 * }
 */
export const fetchSiteViaUrl = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    const site = await fetchSiteViaUrlF(req.body.siteUrl)
    return res.json({ site })
};
