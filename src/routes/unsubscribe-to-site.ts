import { Request, Response } from 'express';
import Joi = require('joi');
import { unsubscribeUserToSite } from '../utils/helpers-sites';

const scheme = Joi.object({
    siteUid: Joi.string().required(),
})

/**
 * @api {post} api/unsubscribe-to-site Subscribe to site
 * @apiDescription Unsubscribe to this site, get page updates.
 * @apiName unsubscribeToSite
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string
 * }
 * @apiPermission [authenticated]
 */
export const unsubscribeToSite = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        await unsubscribeUserToSite(req.user.uid, req.body.siteUid)

        return res.status(200).end()

    } catch (e) {
        throw e;
    }
}