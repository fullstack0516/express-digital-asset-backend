import { checkJwt } from './../utils/helpers-auth';
import { recordVisit } from './../utils/helpers-pages';
import { Request, Response } from 'express';
import Joi = require('joi');

const scheme = Joi.object({
    pageUid: Joi.string().required(),
})

/**
 * @api {post} api/record-page-visit Record visit to site
 * @apiDescription Record the site visit.
 * @apiName recordVisit
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string
 * }
 * @apiPermission [authenticated]
 */
export const recordPageVisit = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        await recordVisit(req.body.pageUid)

        // TODO If they are logged in; process the tags
        if (req.jwt) {
            // const user = await checkJwt(req.jwt)
        }

        return res.status(200).end()

    } catch (e) {
        throw e;
    }
}