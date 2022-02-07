import { getBlacklistedCategories as getBlacklistedCategoriesF } from '../utils/helpers-data-tags';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const schema = Joi.object({
});

/**
 * @api {post} api/get-blacklisted-categories Gets the blacklisted categories.
 * @apiDescription Get Blacklisted Categories
 * @apiName getBlacklistedCategories
 * @apiGroup User
 */
export const getBlacklistedCategories = async (req: Request, res: Response) => {
    await schema.validateAsync(req.body)
    const blacklistedCategories = await getBlacklistedCategoriesF(req.user.uid)
    return res.json({ blacklistedCategories })
}
