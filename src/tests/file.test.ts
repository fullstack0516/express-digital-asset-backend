import test from 'ava';
import * as supertest from 'supertest';
import Joi = require('joi');
import Axios from 'axios';
import { appLoaded, ok } from './index.test';

test('api/upload-photo - small photo', async t => {
    // Check small image
    const testImageSmall = `${__dirname}/test-assets/320x240.jpg`
    const res = await supertest(appLoaded)
        .post('/api/upload-photo/')
        .set({
            'content-type': 'application/octet-stream',
        })
        .attach("photo", testImageSmall, { contentType: 'application/octet-stream' })
        .expect(ok)
    const validateUrl = Joi.string().uri()
    await validateUrl.validateAsync(res.body)

    await Axios.get(res.body)

    t.pass()
})

test('api/upload-photo - large photo', async t => {
    // Check small image
    const testImageSmall = `${__dirname}/test-assets/2560x1440.jpg`
    const res = await supertest(appLoaded)
        .post('/api/upload-photo/')
        .set({
            'content-type': 'application/octet-stream',
        })
        .attach("photo", testImageSmall, { contentType: 'application/octet-stream' })
        .expect(ok)
    const validateUrl = Joi.string().uri()
    await validateUrl.validateAsync(res.body)
    t.pass()
})

test('api/upload-photo - tall photo', async t => {
    // Check small image
    const testImageSmall = `${__dirname}/test-assets/tall-photo.png`
    const res = await supertest(appLoaded)
        .post('/api/upload-photo/')
        .set({
            'content-type': 'application/octet-stream',
        })
        .attach("photo", testImageSmall, { contentType: 'application/octet-stream' })
        .expect(ok)
    const validateUrl = Joi.string().uri()
    await validateUrl.validateAsync(res.body)
    t.pass()
})


test('api/upload-photo - Resize height 1000', async t => {
    // Check small image
    const testImageSmall = `${__dirname}/test-assets/2560x1440.jpg`
    const res = await supertest(appLoaded)
        .post('/api/upload-photo/')
        .set({
            'content-type': 'application/octet-stream',
        })
        .field('resizeHeight', 1000)
        .attach("photo", testImageSmall, { contentType: 'application/octet-stream' })
        .expect(ok)
    const validateUrl = Joi.string().uri()
    await validateUrl.validateAsync(res.body)
    t.pass()
})