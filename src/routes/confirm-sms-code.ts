import { Request, Response } from 'express';
import Joi = require('joi');
import { isTestMode } from '../..';
import { User, userSchema } from '../models/user';
import { createUid } from '../utils/helpers';
import { createJwt } from '../utils/helpers-auth';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import { randomDummyProfilePhoto } from '../utils/helpers-photos';
import { confirmSMS as confirmSMSFunc } from '../utils/helpers-sms';
import { RouteError } from '../utils/route-error';

const schema = Joi.object({
    verificationId: Joi.string().required(),
    smsCode: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    username: Joi.string().min(2).max(17).optional(),
});

/**
 * @api {post} api/confirm-sms-code Send SMS (Login)
 * @apiDescription Confirm SMS Code
 * @apiName login
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *     verificationId: string, // From 'send-sms-code'
 *     smsCode: string, // The sms code from the SMS.
 *     phoneNumber: string,
 *     // Include the username optionally if you want to create a new user.
 *     username?: string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      user: <User>,
 *      jwt: string
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500
 * {
 *   statusCode: no-user-exists | invalid-fields
 * }
 */
export const confirmSMSCode = async (req: Request, res: Response) => {
    try {
        await schema.validateAsync(req.body);

        const { smsCode, verificationId, phoneNumber, username } = req.body;

        if (!isTestMode() && !(phoneNumber as string).includes('+19999')) {
            await confirmSMSFunc(smsCode, verificationId);
        }

        let user = (await mongoDb.collection(collectionNames.users).findOne({ phoneNumber })) as User;
        if (!user && !username) {
            throw new RouteError('no-user-exists', 'No user exists with this combination. And a username was not provided.');
        } else if (username) {
            user = await signUp(username, phoneNumber);
        }

        const jwt = await createJwt(user.uid);

        return res.status(200).json({ user, jwt });
    } catch (e) {
        throw e;
    }
};

const signUp = async (username: string, phoneNumber: string): Promise<User> => {
    if (username) {
        const checkUsernameUser = await mongoDb.collection(collectionNames.users).findOne<User | undefined>({ username });
        if (checkUsernameUser) {
            throw new RouteError('username-exists', 'Username exists.');
        }

        // Make the user.
        const user: User = {
            uid: createUid(),
            username: username,
            phoneNumber: phoneNumber,
            profileMedia: randomDummyProfilePhoto(),
            createdIso: new Date().toISOString(),
            isDeleted: false,
            isFlagged: false,
            isBanned: false,
            isAdmin: false,
            lastOpenedAppIso: new Date().toISOString(),
            reports: {},
            totalImpressionsOnSites: 0,
            totalVisitsOnSites: 0,
        };

        await userSchema.validateAsync(user);
        await mongoDb.collection(collectionNames.users).insertOne(user);

        return user;
    } else {
        throw new RouteError('no-username-on-signup', 'You provided an SMS number that does not exist with no username.');
    }
};
