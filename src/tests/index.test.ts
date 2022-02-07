import { createDummyContent } from './dummy-content.test';
import test from 'ava';
import { init } from '../../index';
import * as supertest from 'supertest'
import { adjectives, colors, animals } from 'unique-names-generator';
import { createUsername, makeFakeNumber } from '../utils/helpers';
import { User } from '../models/user';

export let appLoaded;
export const userPassword = 'testtest123';

export const customNamesConfig = {
    dictionaries: [adjectives, colors, animals],
    separator: '',
    length: 2,
};

export const createTestUser = async (): Promise<{ user: User, jwt: string }> => {
    const data = await supertest(appLoaded)
        .post('/api/confirm-sms-code/')
        .send({
            username: createUsername(),
            verificationId: '123',
            smsCode: '123',
            phoneNumber: makeFakeNumber(),
        })
        .expect(ok)
    return data.body;
}

export const uploadPhotoForTest = async (file: string): Promise<string> => {
    const res = await supertest(appLoaded)
        .post('/api/upload-photo/')
        .set({
            'content-type': 'application/octet-stream',
        })
        .attach("photo", file, { contentType: 'application/octet-stream' })
        .expect(ok)
    const url = res.body as string
    return url;
}




/**
 * Sometimes AVA doesn't spit out errors
 * https://github.com/visionmedia/supertest/issues/95
 */
export const ok = (res) => {
    if (res.status !== 200) {
        console.log(res)
        return new Error('expected 200, got ' + res.status + ' "' + res.message + '" with message: ' + res.text + ', clientData: ' + res.clientData);
    }
}

export const error = (res) => {
    if (res.status == 200) {
        console.log(res)
        return new Error('expected error, got ' + res.status + ' "' + res.message + '" with message: ' + res.text + ', clientData: ' + res.clientData);
    }
}

// Init App, load mongo, load config, make test user.
test.before('Init Server', async t => {
    if (!appLoaded) {
        appLoaded = await init();
    }
    t.pass();
})

// Check API is running
test('/api/', async t => {
    await supertest(appLoaded)
        .get('/api/')
        .expect(200)
    t.pass();
});