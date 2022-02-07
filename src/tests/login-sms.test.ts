import test from 'ava';
import { appLoaded, error, ok } from './index.test'
import * as supertest from 'supertest'
import { makeFakeNumber } from '../utils/helpers';
import { userSchema } from '../models/user';

// test('api/send-sms-code & login', async t => {
//     const result = await supertest(appLoaded)
//         .post('/api/send-sms-code/')
//         .send({
//             phoneNumber: makeFakeNumber(),
//         })
//         .expect(ok)
//     await userSchema.validateAsync(result.body.user)
//     t.pass()
// });

test('api/send-sms-code & invalid params', async t => {
    const result = await supertest(appLoaded)
        .post('/api/send-sms-code/')
        .send({
            // Invalid fields
            email: '',
            password: '',
        })
        .expect(error)
    t.is(result.body.statusCode, 'invalid-fields')
});
