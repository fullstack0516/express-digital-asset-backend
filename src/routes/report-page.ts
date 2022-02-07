import { reportPage as reportPageF } from './../utils/helpers-pages';
import { Request, Response } from 'express';
import * as Joi from 'joi'

const scheme = Joi.object({
    pageUid: Joi.string().required(),
    reasonDesc: Joi.string().required().min(10),
})


/**
 * @api {post} api/report-page ReportPage
 * @apiDescription Report Page
 * @apiName reportPage
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *      pageUid: string,
 *      reasonDesc: string,
 * }
 */
export const reportPage = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        await reportPageF(
            req.body.pageUid,
            req.user.uid,
            req.body.reasonDesc,
        );

        return res.status(200).end();

    } catch (e) {
        throw e;
    }
};