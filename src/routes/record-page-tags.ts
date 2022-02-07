import { updateHistory } from './../utils/helpers-page-history';
import { Request, Response } from 'express';
import * as Joi from 'joi';
import { recordDataTagsForUser } from '../utils/helpers-data-tags';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
})

/**
 * @api {post} api/record-page-tags Record the user DataTags.
 * @apiDescription Record Page Tags
 * @apiName recordPageTags
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string
 * }
 */
export const recordPageTags = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)

        const result = await updateHistory(req.body.pageUid, req.user.uid)

        // Record the data tags.
        if (result === 'createdNew' || result == 'pageChanged') {
            await recordDataTagsForUser(req.body.pageUid, req.user.uid)
        }

        return res.json({ result })

    } catch (e) {
        throw e;
    }
};

