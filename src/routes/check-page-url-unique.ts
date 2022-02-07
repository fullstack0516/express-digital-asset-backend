import { Request, Response } from 'express';
import * as Joi from 'joi';
import { isPageUrlUnique } from '../utils/helpers-pages';

const scheme = Joi.object({
    url: Joi.string().regex(/^[a-z0-9-]+$/).required(),
})

/**
 * @api {post} api/check-page-url-unqiue Check Page URL is unique
 * @apiDescription Check that the page URL is unique.
 * @apiName checkPageUrlIsUnique
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     url: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      isUnique: boolean,
 * }
 */
export const checkPageUrlUnique = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    return res.json({
        isUnique: (await isPageUrlUnique(req.body.url))
    })
};
