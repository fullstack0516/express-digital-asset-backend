import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, createTestUser, ok } from './index.test';
import { fetchUser } from '../utils/helpers-users';


test('api/delete-self & check that user sensative data gone', async t => {
    const data = await createTestUser();

    const username = data.user.username;
    const phoneNumber = data.user.phoneNumber;

    await supertest(appLoaded)
        .post('/api/delete-self/')
        .set({
            authorization: data.jwt,
        })
        .expect(ok)

    const user = await fetchUser(data.user.uid)

    t.is(user.phoneNumber == phoneNumber, false)
    t.is(user.username == username, false)
})