import { Request, Response } from 'express';
import Joi = require('joi');
import { subscribeUserToSite } from '../utils/helpers-sites';

const scheme = Joi.object({
    siteUid: Joi.string().required(),
})

/**
 * @api {post} api/subscribe-to-site Subscribe to site
 * @apiDescription Subscribe to this site, get page updates.
 * @apiName subscribeToSite
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string
 * }
 * @apiPermission [authenticated]
 */
export const subscribeToSite = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        await subscribeUserToSite(req.user.uid, req.body.siteUid)

        return res.status(200).end()

    } catch (e) {
        throw e;
    }
}