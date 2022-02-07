import Joi = require('joi')
import { MediaLink, mediaLinkSchema } from './media-link'
import { Location, locationSchema } from './location'
import { UserLight } from './user-light'

// We use JS getDay which starts on sun.
export const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat']

export interface EchoLocation {
    uid: string;
    placeName: string;
    media: MediaLink,
    location: Location,
    description?: string,
    users: {
        [userUid: string]: {
            user: UserLight,
            timeTakenISO: string,
        }
    }
    maxSlots: number,
    availability: OpenTime[]
}

export const echoLocaitonSchema = Joi.object({
    _id: Joi.any(),
    uid: Joi.string().min(9).required(),
    placeName: Joi.string().min(2).required(),
    media: mediaLinkSchema.required(),
    location: locationSchema.required(),
    description: Joi.string(),
    users: Joi.object(),
    maxSlots: Joi.number().required(),
    availability: Joi.array().items(Joi.object({
        day: Joi.required().valid('sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'),
        fromTime24: Joi.number(),
        toTime24: Joi.number(),
    })),
    // For mongo
    loc: Joi.object({
        type: Joi.required().valid('Point'),
        coordinates: Joi.array(),
    })
})

export interface OpenTime {
    day: 'sun' | 'mon' | 'tue' | 'wed' | 'thur' | 'fri' | 'sat',
    fromTime24: number;
    toTime24: number;
}
