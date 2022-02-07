import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { MediaLink } from '../models/media-link';
import * as showdown from 'showdown'

export type Indexer<T> = { [key: string]: T };

const lut: any = []; for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
export const createUid = (): string => {
    const d0 = Math.random() * 0xffffffff | 0;
    const d1 = Math.random() * 0xffffffff | 0;
    const d2 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff]
}

export const sortAlphabetically = (arrayItems: string[]): Array<string> => {
    return arrayItems.sort((a, b) => (a.localeCompare(b)));
}


export const deleteUndefinedKeys = (anyObject: any): any => {
    Object.keys(anyObject).forEach((key: any) => (anyObject[key] === undefined || anyObject[key] === null) ? delete anyObject[key] : '');
    return anyObject;
}

export async function asyncForEach<T>(array: Array<T>, callback: (item: T, index: number) => void) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index);
    }
}

export const createUsername = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 3,
        style: 'capital',
    }).substr(0, 12) + createUid().substring(0,5);
}

export const makeFakeNumber = () => {
    // +19999 is a special number that ignores verificaiton.
    return '+19999' + Math.floor(Math.random() * 1000000);
}

const mediaTypeFromUrl = (url: string): 'photo' | 'video' => {
    if (url.indexOf('.jpg') != -1 || url.indexOf('.png') != -1) {
        return 'photo'
    }

    return 'video';
}

export const convertUrlToMediaLink = (url: string): MediaLink => {
    return {
        url,
        type: mediaTypeFromUrl(url),

    }
}

const showDownConverter = new showdown.Converter();

export const markdownToHtml = (markdown: string) => {
    return showDownConverter.makeHtml(markdown)
}

export const findWithAttr = (array, attr, value) => {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
