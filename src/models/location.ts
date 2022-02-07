import Joi = require('joi')

export interface Location {
    shortName: string;
    longName: string;
    lat: number;
    lng: number;
}

export const locationSchema = Joi.object({
    shortName: Joi.string(),
    longName: Joi.string(),
    lat: Joi.number(),
    lng: Joi.number(),
})