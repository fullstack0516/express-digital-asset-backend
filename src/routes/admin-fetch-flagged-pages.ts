import { fetchFlaggedPages } from './../utils/helpers-admin';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const scheme = Joi.object({
    fromIso: Joi.string().isoDate().required(),
})

/**
 * @api {post} api/admin-fetch-flagged-pages Check Page URL is unique
 * @apiDescription Check that the page URL is unique.
 * @apiName checkPageUrlIsUnique
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     fromIso: string; // For pagination.
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      pages,
 * }
 */
export const adminFetchFlaggedPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const pages = await fetchFlaggedPages(req.body.fromIso)

    return res.json({
        pages
    })
};
