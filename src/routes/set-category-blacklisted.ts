import { blacklistCategory } from './../utils/helpers-data-tags';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const schema = Joi.object({
    categoryName: Joi.string().required(),
});

/**
 * @api {post} api/set-category-blacklisted Blacklist a data category for the user.
 * @apiDescription Set Category Blacklisted
 * @apiName setCategoryBlacklisted
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *     categoryName: string
 * }
 */
export const setCategoryBlacklisted = async (req: Request, res: Response) => {
    await schema.validateAsync(req.body)

    await blacklistCategory(req.body.categoryName, req.user.uid)

    return res.status(200).end()
}
