import { Request, Response } from 'express';
import * as Joi from 'joi'
import { checkEmailToken } from '../utils/helper-email'
import { updateUser, fetchUser } from '../utils/helpers-users'


const scheme = Joi.object({
    code: Joi.string().required()
})

/**
 * @api {post} api/confirm-backup-email confirmBackupEmail
 * @apiDescription confirm the backup email
 * @apiName confirmBackupEmail
 * @apiGroup Generic
 * @apiParamExample {json} Request-Example:
 * {
 *      code: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      user: <User>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *      statusCode: email-not-confirmed
 * }
 */
export const confirmBackupEmail = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        const { user, email } = await checkEmailToken(req.body.code);
        // update the user information
        await updateUser(user.uid, { email: email });

        res.status(200).json({ user: await fetchUser(user.uid) });
    } catch (e) {
        throw e;
    }
};
