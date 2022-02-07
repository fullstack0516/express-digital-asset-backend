import { Request, Response } from 'express';
import Joi = require('joi');
import { checkUserSubscription } from '../utils/helpers-sites';

const scheme = Joi.object({
    siteUid: Joi.string().required(),
})

/**
 * @api {post} api/check-site-subscribed 
 * @apiDescription check user subscribed site or not
 * @apiName checkSubscribedSite
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string
 * }
 * @apiPermission [authenticated]
 */

export const checkSubscribedSite = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        const isSubscribed = await checkUserSubscription(req.user.uid, req.body.siteUid)

        return res.json({
            isSubscribed
        })

    } catch (e) {
        throw e;
    }
}