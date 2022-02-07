import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchMyData as fetchMyDataF } from '../utils/helpers-data-tags'

const scheme = Joi.object({
    fromIso: Joi.string().isoDate().required(),
    category: Joi.string().optional(),
})

/**
 * @api {post} api/fetch-my-data Fetch the users data
 * @apiDescription Fetch My Data
 * @apiName fetchMyData
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     fromIso: string,
 *     category?: string
 * }
 */
export const fetchMyData = async (req: Request, res: Response) => {

    try {
        await scheme.validateAsync(req.body)

        const myData = await fetchMyDataF(
            req.user.uid,
            {
                fromIso: req.body.fromIso,
                category: req.body.category,
            },
        )
        
        return res.json({ myData })

    } catch (e) {
        throw e;
    }
};
