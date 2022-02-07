import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchPopularPages } from './../utils/helpers-discover';

const scheme = Joi.object({
    category: Joi.string().optional(),
    itemNumber: Joi.number().min(0).required()
})

/**
 * @api {post} api/api/discover-fetch-popular-pages Fetch Popular pages
 * @apiDescription Fetch the most popular pages.
 * @apiName discoverFetchPopularPages
 * @apiGroup Discover
 * @apiParamExample {json} Request-Example:
 * {
 *     category?: string
 *     itemNumber: number
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      pages,
 *      itemNumber
 * }
 */
export const discoverFetchPopularPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    const { pages, itemNumber } = await fetchPopularPages(req.body.itemNumber, req.body.category)

    return res.json({
        pages,
        itemNumber
    })
};
