import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchNewPages } from '../utils/helpers-discover';

const scheme = Joi.object({
    category: Joi.string().optional(),
    fromIso: Joi.string().isoDate().optional(),
})

/**
 * @api {post} api/discover-fetch-new-pages Fetch New pages
 * @apiDescription Fetch the most new pages.
 * @apiName discoverFetchNewPages
 * @apiGroup Discover
 * @apiParamExample {json} Request-Example:
 * {
 *     category?: string
 *     fromIso?: iso date
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      pages
 * }
 */
export const discoverFetchNewPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const pages = await fetchNewPages(req.body.category, req.body.fromIso)

    return res.json({
        pages
    })
};
