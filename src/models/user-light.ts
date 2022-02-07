import Joi = require('joi')
import { MediaLink, mediaLinkSchema } from './media-link'

export interface UserLight {
    uid: string,
    username: string,
    profileMedia: MediaLink,
}

export const userLightSchema = Joi.object({
    _id: Joi.any(),
    uid: Joi.string(),
    username: Joi.string().min(2).max(40).required(),
    profileMedia: mediaLinkSchema,
})
