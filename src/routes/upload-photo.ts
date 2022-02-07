import * as request from 'request';
import { Response, Request } from 'express';
import { Config } from '../utils/config';
import * as fs from 'fs'
import { RouteError } from '../utils/route-error';
import { createUid } from '../utils/helpers';
import { uploadImageToStorage } from '../utils/helper-storage'
import Joi = require('joi');
const sharp = require('sharp');

const scheme = Joi.object({
    resizeHeight: Joi.string().custom((value) => {
        const height = parseInt(value)
        if (height && height > 24 && height < 2080) {
            return true
        }
    }).optional()
})

/**
 * @api {post} api/upload-photo Upload photo
 * @apiDescription Upload a photo and get a url.
 * @apiName uploadPhoto
 * @apiGroup Util
 * @apiParamExample {json} Request-Example:
 * {
 *     // If this is not provided; it will use 720.
 *     resizeHeight?: number,
 * }
 * @apiPermission []
 * @apiSuccess {String} url URL of the photo.
 */
export const uploadPhoto = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)

        const file = req.file
        let height = req.body?.resizeHeight;
        if (!height) {
            height = 720;
        } else {
            height = parseInt(height)
        }

        await sharp(file.path)
            .resize({
                fit: sharp.fit.contain,
                height,
            })
            .jpeg({ quality: 90 })
            .toFile(file.path + '_compress.jpg')

        const base64 = await fs.readFileSync(file.path + '_compress.jpg', { encoding: 'base64' });

        try {
            await validateFaceOnVisionAPI(base64)
        } catch (e) {
            throw new RouteError('invalid-photo', 'The photo failed validation on the vision API.')
        }

        const path = 'photos/' + createUid();
        const uplaodedFile = await uploadImageToStorage(path, base64, '.jpg')

        await uplaodedFile.makePublic()
        const metaData = await uplaodedFile.getMetadata()
        const url = metaData[0].mediaLink

        fs.unlinkSync(file.path);
        fs.unlinkSync(file.path + '_compress.jpg');

        return res.status(200).json(url);
    } catch (e) {
        throw e;
    }
}

const validateFaceOnVisionAPI = async (base64Image: string): Promise<any> => {

    const requestData = {
        'requests': [{
            'image': {
                'content': base64Image,
            },
            'features': [
                {
                    'type': 'LABEL_DETECTION',
                },
                {
                    'type': 'SAFE_SEARCH_DETECTION',
                },
            ],
        }],
    }

    const url = 'https://vision.googleapis.com/v1/images:annotate?key=' + Config.googleCloudApiKey

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }

    await new Promise((resolve, reject) => {
        request.post(url, { json: requestData, headers }, (error, response, body) => {

            if (error) {
                reject(error)
                return
            }
            if (response.statusCode !== 200) {
                reject(response)
                return
            }

            const visionResponse = body.responses as [any]
            visionResponse.forEach((vision) => {

                // Filter children, no kids.
                let childDetected = false
                if (vision.labelAnnotations) {

                    // Check for child percentage.
                    vision.labelAnnotations.forEach((label: any) => {
                        if (label.description === 'Child' || label.description === 'Toddler') {
                            // Over X%
                            if (label.score > 0.7) {
                                childDetected = true
                            }
                        }
                    })

                    if (childDetected) {
                        reject('Child was detected in the photo.')
                        return
                    }
                }

                // Check the picture isn't bad.
                const safeSearchAnnotation = vision.safeSearchAnnotation
                if (safeSearchAnnotation) {
                    if (
                        safeSearchAnnotation.violence === 'POSSIBLE' ||
                        safeSearchAnnotation.violence === 'LIKELY' ||
                        safeSearchAnnotation.violence === 'VERY_LIKELY'
                    ) {
                        reject('Photo was potencially violent')
                    }
                    if (
                        safeSearchAnnotation.adult === 'POSSIBLE' ||
                        safeSearchAnnotation.adult === 'LIKELY' ||
                        safeSearchAnnotation.adult === 'VERY_LIKELY'
                    ) {
                        reject('Photo was potencially adult')
                    }
                }
            })
            resolve(null)
        })
    })
}
