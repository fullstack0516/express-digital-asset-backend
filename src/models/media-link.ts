import Joi = require('joi')

export interface MediaLink {
    url: string,
    type: 'photo' | 'video',
}

export const mediaLinkSchema = Joi.object({
    url: Joi.string().uri().required(),
    type: Joi.required().valid('photo', 'video').required(),
})
