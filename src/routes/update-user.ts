import { Request, Response } from 'express';
import { fetchUser } from '../utils/helpers-users';
import * as Joi from 'joi'
import { mediaLinkSchema } from '../models/media-link';
import { updateUser as updateUserF } from '../utils/helpers-users'
import { sendMail, createEmailToken } from '../utils/helper-email'

const scheme = Joi.object({
    username: Joi.string().min(2).max(17).optional(),
    email: Joi.string().email().optional(),
    bio: Joi.string().min(0).max(512).optional(),
    phoneNumber: Joi.string().min(3).optional(),
    profileMedia: mediaLinkSchema.optional(),
    lastOpenedAppIso: Joi.string().isoDate().optional(),
})


/**
 * @api {post} api/update-user UpdateUser
 * @apiDescription Update User
 * @apiName updateUser
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *      username: string
 *      profileMedia: <MediaLink>
 *      lastOpenedAppIso?: string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      user: <User>,
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *   statusCode: invalid-fields
 * }
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const origin = req.get('origin');
        const newEmail = req.body.email;
        const updatedUser = req.body;
        await scheme.validateAsync(updatedUser);

        // we don't update the email information soon
        // it will be updated when the user will confirm the email address
        delete updatedUser.email;
        await updateUserF(req.user.uid, updatedUser);

        // if email was changed, we need to confirm email address
        if (newEmail && req.user.email !== newEmail) {
            // generate the token for email confirmation
            const emailToken = await createEmailToken(req.user.uid, newEmail);
            const emailConfirmLink = `${origin}/confirm-email?code=${emailToken}`;

            const mailOptions = {
                from: 'Awake',
                to: newEmail,
                subject: "Hello ✔",
                text: "Please click the following link to confirm your backup email.",
                html: '<h2>Email Confirmation link <a href="' + emailConfirmLink + '">here</a></h2>',
            }
            await sendMail(mailOptions);
        }

        return res.status(200).json({ user: await fetchUser(req.user.uid) });

    } catch (e) {
        throw e;
    }
};
