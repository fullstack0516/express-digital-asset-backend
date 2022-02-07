import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchTrendingPages } from '../utils/helpers-discover';

const scheme = Joi.object({
    category: Joi.string().optional(),
    itemNumber: Joi.number().min(0).required()
})

/**
 * @api {post} api/api/discover-fetch-trending-pages Fetch Trending pages
 * @apiDescription Fetch the trending pages.
 * @apiName discoverFetchTrendingPages
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
export const discoverFetchTrendingPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    const { pages, itemNumber } = await fetchTrendingPages(req.body.itemNumber, req.body.category)

    return res.json({
        pages,
        itemNumber
    })
};
