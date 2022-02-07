import { Request, Response } from 'express';
import * as Joi from 'joi';
import { isSiteUrlUnique } from '../utils/helpers-sites';

const scheme = Joi.object({
    url: Joi.string().regex(/^[a-z0-9-]+$/).required(),
})

/**
 * @api {post} api/check-site-url-unqiue Check Site URL is unique
 * @apiDescription Check that the site URL is unique.
 * @apiName checkSiteUrlIsUnique
 * @apiGroup Sites
 * @apiParamExample {json} Request-Example:
 * {
 *     url: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      isUnique: boolean,
 * }
 */
export const checkSiteUrlUnique = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    return res.json({
        isUnique: (await isSiteUrlUnique(req.body.url))
    })
};
