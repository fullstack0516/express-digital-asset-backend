import { isProduction } from './../utils/config';
import { Request, Response } from 'express';
import * as Joi from 'joi';
import { isTestMode } from '../..';
import { User } from '../models/user';
import { createJwt } from '../utils/helpers-auth';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import { sendSMSCode as sendSMSCodeFunc } from '../utils/helpers-sms';

const schema = Joi.object({
    phoneNumber: Joi.string().min(2).max(50),
});

/**
 * @api {post} api/send-sms-code Send SMS (Login)
 * @apiDescription Send SMS
 * @apiName login
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *     phoneNumber: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *     verificationCode: string
 *     userExists: boolean,
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500
 * {
 *   statusCode: invalid-fields
 * }
 */
export const sendSMSCode = async (req: Request, res: Response) => {
    try {
        await schema.validateAsync(req.body);

        const { phoneNumber } = req.body;
        // Check if the old user exists.
        const oldUser = (await mongoDb.collection(collectionNames.users).findOne({ phoneNumber })) as User | undefined;
        if (oldUser) {
            if (isTestMode()) {
                return res.status(200).json({ oldUser, jwt: await createJwt(oldUser.uid) });
            }

            if ((phoneNumber as string).includes('+19999') && !isProduction()) {
                return res.status(200).json({ verificationCode: '9999', userExists: true });
            }

            const verificationCode = await sendSMSCodeFunc(phoneNumber);
            return res.status(200).json({ verificationCode, userExists: true });
        } else {
            const verificationCode = await sendSMSCodeFunc(phoneNumber);
            return res.status(200).json({ verificationCode, userExists: false });
        }
    } catch (e) {
        throw e;
    }
};
