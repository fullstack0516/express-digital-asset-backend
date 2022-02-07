import { Request, Response } from 'express';
import Joi = require('joi');
import { recordImpression } from '../utils/helpers-pages';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
})

/**
 * @api {post} api/record-page-impression Record impression to site
 * @apiDescription Record the site impression, impression isn't a visit; impression is when the site is seen with other sites, like 'top sites'
 * @apiName recordImpression
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string
 * }
 * @apiPermission [authenticated]
 */
export const recordPageImpression = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        await recordImpression(req.body.pageUid)

        return res.status(200).end()

    } catch (e) {
        throw e;
    }
}