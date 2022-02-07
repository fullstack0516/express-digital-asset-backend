import { Request, Response } from 'express';
import Joi = require('joi');
import { isTestMode } from '../..';
import { confirmSMS as confirmSMSFunc } from '../utils/helpers-sms';
import { RouteError } from '../utils/route-error';
import { updateUser as updateUserF } from '../utils/helpers-users'

const schema = Joi.object({
    verificationId: Joi.string().required(),
    smsCode: Joi.string().required(),
    phoneNumber: Joi.string().required(),
});

/**
 * @api {post} api/confirm-change-sms
 * @apiDescription Confirm SMS Code to change the phone number
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *     verificationId: string, // From 'send-sms-code'
 *     smsCode: string, // The sms code from the SMS.
 *     phoneNumber: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      SMSVerified: boolean
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500
 * {
 *   statusCode: sms-code-incorrect
 * }
 */

export const confirmChangeSMS = async (req: Request, res: Response) => {
    try {
        await schema.validateAsync(req.body);

        const { smsCode, verificationId, phoneNumber } = req.body;

        if (!isTestMode()) {
            await confirmSMSFunc(smsCode, verificationId);
        }
        // update the user information with new phone number
        await updateUserF(req.user.uid, { phoneNumber: phoneNumber });

        return res.status(200).json({ SMSVerified: true });
    } catch (e) {
        throw e;
    }
};