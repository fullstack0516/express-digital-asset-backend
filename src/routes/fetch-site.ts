import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchSite as fetchSiteF } from '../utils/helpers-sites'

const scheme = Joi.object({
    siteUid: Joi.string().required(),
})

/**
 * @api {post} api/fetch-site Fetch Site
 * @apiDescription Fetches site
 * @apiName fetchSite
 * @apiGroup Sites
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      site: <Site>
 * }
 */
export const fetchSite = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    const site = await fetchSiteF(req.body.siteUid)
    return res.json({ site })
};
