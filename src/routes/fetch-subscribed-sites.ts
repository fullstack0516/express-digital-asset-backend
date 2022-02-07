import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchSubscribedSites as fetchSubscribedSitesF } from '../utils/helpers-sites'

const scheme = Joi.object({})

/**
 * @api {post} api/api/fetch-subscribed-sites Fetch User Subscribed sites
 * @apiDescription Fetch the trending pages.
 * @apiName FetchSubscribedSites
 * @apiGroup User
 * @apiSuccessExample {json} Success-Response:
 * {
 *      sites
 * }
 */
export const fetchSubscribedSites = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const sites = await fetchSubscribedSitesF(req.user.uid)

    return res.json({
        sites
    })
};
