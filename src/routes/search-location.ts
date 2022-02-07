import { Request, Response } from 'express';
import { logError } from '../utils/logger';
import * as axios from 'axios';
import { Config } from '../utils/config';
import { RouteError } from '../utils/route-error';
import Joi = require('joi');
import { Location } from '../models/location'

const scheme = Joi.object({
    searchTerm: Joi.string().required(),
})

/**
 * @api {post} api/search-location Search location
 * @apiDescription Search a location and return results with lat, long, name, long name attached
 * @apiName searchLocation
 * @apiGroup Util
 * @apiParamExample {json} Request-Example:
 * {
 *     searchTerm: 'Search term like "Oslo"',
 * }
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200
 * {
 *     searchResults: <Location>[]
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500
 * {
 *    statusCode: 'error-searching-location' | 'invalid-fields'
 *    details: 'Why it failed',
 * }
 **/
export const searchLocation = async (req: Request, res: Response) => {

    try {

        await scheme.validateAsync(req.body)

        const searchTerm = req.body.searchTerm;
        const places = await axios.default.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchTerm}&key=${Config.googleCloudApiKey}`)

        if (!searchTerm) {
            throw res.end();
        }

        if (places.status !== 200) {
            logError('Error getting places: ' + places.statusText);
            throw new RouteError('error-searching-location', 'Error getting places, search term: ' + searchTerm);
        }

        const fetchLatLong = async (place: any) => {
            const latLongPlace = await axios.default.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${place.place_id}&key=${Config.googleCloudApiKey}`)

            if (latLongPlace.status !== 200) {
                throw new RouteError('error-searching-location', 'Lat long request failed: ' + latLongPlace.statusText);
            }

            let finalResult: Location;
            const result = latLongPlace.data.result;

            // Format the results.
            if (result && result.geometry && result.geometry.location) {
                finalResult = {
                    shortName: place.description,
                    longName: place.description,
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng,
                }
            }

            return finalResult;
        }

        // Fetch the geo-location
        const latLongPlaces = await Promise.all((places.data.predictions as any[]).map((place) => fetchLatLong(place)))

        return res.status(200).json({ searchResults: latLongPlaces })

    } catch (e) {
        throw e;
    }
};