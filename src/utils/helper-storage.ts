import { logError } from './logger';
import { greyImage } from '../routes/page-section-add';
import { createUid } from './helpers';
import { Config } from './config';
import * as gcs from '@google-cloud/storage';
import { isTestMode } from '../..';
import * as urlUtil from 'url'

const storage = new gcs.Storage();

export const uploadImageToStorage = async (storagePath: string, base64Image: string, customExtention = ''): Promise<any> => {

    const photoPath = storagePath + createUid() + customExtention;

    // Save the base64 to storage.
    const file = storage.bucket(Config.storageBucket).file(photoPath);

    await file.save(new Buffer(base64Image, 'base64'), {
        metadata: { contentType: base64MimeType(base64Image) },
        public: true,
        validation: 'md5',
    })

    return file;
}

export const deleteFileViaUrl = async (url: string) => {

    /**
     * Don't delete dummys or grey.
     */
    if (Config.dummyProfilePhotos.includes(url) || url === greyImage || url.includes('picsum.photos')) {
        if (isTestMode()) {
            console.log('deleteFileViaUrl: Was dummy file | picsum | greybg.')
        }
        return true;
    }

    const urlDecoded = urlUtil.parse(url)
    const photosPath = urlUtil.parse(urlDecoded.path.split('/')[urlDecoded.path.split('/').length - 1])
    const fileName = decodeURIComponent(photosPath.pathname)

    try {
        const file = storage.bucket(Config.storageBucket).file(fileName);
        if (!file.exists()) {
            throw 'file does not exist, url: ' + url;
        }
        await file.delete()
        return true;
    } catch (e) {
        logError('Could not delete file from storage. Url: ' + url, e)
    }
}

const base64MimeType = (encoded: any) => {
    let result = null;
    if (typeof encoded !== 'string') {
        return result;
    }
    const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) {
        result = mime[1];
    }
    return result;
}

