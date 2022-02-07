import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchHomePages } from '../utils/helpers-discover';

const scheme = Joi.object({
    category: Joi.string().optional(),
    itemNumber: Joi.number().min(0).required()
})

/**
 * @api {post} api/api/discover-fetch-home-pages Fetch home pages
 * @apiDescription Fetch the home pages.
 * @apiName discoverFetchHomePages
 * @apiGroup Discover
 * @apiParamExample {json} Request-Example:
 * {
 *     category?: string,
 *     itemNumber: number
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      pages,
 *      itemNumber
 * }
 */
export const discoverFetchHomePages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    const { pages, itemNumber } = await fetchHomePages(req.body.itemNumber, req.body.category)

    return res.json({
        pages,
        itemNumber
    })
};
