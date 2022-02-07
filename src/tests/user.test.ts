import test from 'ava';
import { appLoaded, createTestUser, error, ok } from './index.test';
import { createUid, createUsername } from '../utils/helpers';
import * as supertest from 'supertest';
import { createTestSite } from './sites.test';
import { fetchUserSites } from './../routes/fetch-my-sites';
import { updateSite, deleteUserSites, subscribeUserToSite, unsubscribeUserToSite } from '../utils/helpers-sites';
import { createPageUrl, createTestPage } from './pages.test';


test('api/update-user & update username', async t => {
    const data = await createTestUser();
    const username = createUsername();
    const result = await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            username,
        })
        .expect(ok)
    t.is(result.body.user.username, username)
});

test('api/update-user & break admin', async t => {
    const data = await createTestUser();
    const result = await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            isAdmin: true,
        })
        .expect(error)
    t.pass()
});

test('api/update-user & undo delete', async t => {
    const data = await createTestUser();
    const result = await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            isDeleted: false,
        })
        .expect(error)
    t.pass()
});


test('api/update-user & test username too long', async t => {
    const data = await createTestUser();
    await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            username: 'fwewuwenewiwi0v0nv0vn20n290v2nvew0ewnv0w9envwe90' + createUid(),
        })
        .expect(error)
    t.pass()
});


test('api/update-user & break medialinks', async t => {
    const data = await createTestUser();

    await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            mediaLinks: [{
                type: 'broken',
                url: 'none'
            }],
        })
        .expect(error)

    await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            mediaLinks: [{
                type: 'photo',
                url: 'none'
            }],
        })
        .expect(error)

    await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            mediaLinks: [{
                type: 'broken',
            }],
        })
        .expect(error)

    await supertest(appLoaded)
        .post('/api/update-user/')
        .set({
            authorization: data.jwt,
        })
        .send({
            profileMedia: {
                type: 'photo',
                url: 'https://imgur.com/gallery/hZc3yZW'
            },
        })
        .expect(ok)
    t.pass()
});

test('api/add-backup-email', async (t) => {
    const data = await createTestUser();
    await supertest(appLoaded)
        .post('/api/add-backup-email/')
        .set({
            authorization: data.jwt,
        })
        .send({
            uid: data.user.uid,
            email: data.user.email
        })
        .expect(error)

    t.pass()
});

test('Test delete sites - ok', async t => {

    const data = await createTestUser()
    await createTestSite({ jwt: data.jwt })

    await deleteUserSites(data.user.uid)

    const sites = await fetchUserSites(data.user.uid, new Date().toISOString())

    t.is(sites.length === 0, true)
})


test('Test delete sites not deleted', async t => {

    const data = await createTestUser()
    const data2 = await createTestUser()
    const site = await (await createTestSite({ jwt: data.jwt })).site

    await updateSite(site.uid, { siteOwnersUids: [data.user.uid, data2.user.uid] })

    await deleteUserSites(data.user.uid)

    const sites = await fetchUserSites(data.user.uid, new Date().toISOString())
    t.is(sites.length === 0, true)

    const sitesOtherUser = await fetchUserSites(data2.user.uid, new Date().toISOString())
    t.is(sitesOtherUser.length === 1, true)
})

test('api/check-site-subscribed - check user subscribed', async t => {
    const site = await createTestSite()

    await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    await supertest(appLoaded)
        .post('/api/subscribe-to-site/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid,
        })
        .expect(ok)

    const res = await supertest(appLoaded)
        .post('/api/check-site-subscribed/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid
        })
        .expect(ok)

    t.is(res.body.isSubscribed === true, true)
    t.pass()
})

test('api/check-site-subscribed - check user unsubscribed', async t => {
    const site = await createTestSite();
    await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    await supertest(appLoaded)
        .post('/api/subscribe-to-site/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid,
        })
        .expect(ok)

    await supertest(appLoaded)
        .post('/api/unsubscribe-to-site/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid,
        })
        .expect(ok)

    t.pass()

    const res = await supertest(appLoaded)
        .post('/api/check-site-subscribed/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid
        })
        .expect(ok)

    t.is(res.body.isSubscribed === false, true)
    t.pass()
})
