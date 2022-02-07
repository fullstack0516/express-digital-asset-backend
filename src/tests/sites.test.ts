import { subscribeUserToSite } from './../utils/helpers-sites';
import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, createTestUser, error, ok } from './index.test';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import Axios from 'axios';
import { LoremIpsum } from 'lorem-ipsum';
import Site, { siteSchema } from '../models/site';
import { createUid } from '../utils/helpers';
import { createTestPage } from './pages.test';
import { updateUser } from '../utils/helpers-users';

const createSiteName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 1,
        style: 'capital',
    });
}

const createSiteUrl = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
        style: 'lowerCase',
    });
}


const createDesc = () => {
    const lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 4
        },
        wordsPerSentence: {
            max: 16,
            min: 4
        }
    });
    return lorem.generateSentences(Math.ceil((Math.random() + 1) * 5)).substr(0, 500);
}

export const createTestSite = async (props?: { jwt?: string, overrideData?: any }): Promise<{ jwt: string, site: Site }> => {

    let jwt;

    if (props?.jwt) {
        jwt = props.jwt;
    } else {
        const data = await createTestUser();
        jwt = data.jwt
    }

    const pictureData = await Axios.get('https://picsum.photos/400/400')
    const photoUrl = pictureData.request.res.responseUrl;

    const sendData = {
        ...{
            name: createSiteName(),
            siteColor: '#FF0000',
            siteIcon: {
                type: 'photo',
                url: photoUrl,
            },
            description: createDesc().substr(0, 500),
            // Lower case and hypthens only.
            url: createSiteUrl(),
        },
        ...props?.overrideData ?? {},
    }

    const res = await supertest(appLoaded)
        .post('/api/create-site/')
        .set({
            authorization: jwt,
        })
        .send(sendData)
        .expect(ok)

    const site = res.body.site as Site
    await siteSchema.validateAsync(site)

    return {
        jwt,
        site,
    }
}


test('api/create-site - create basic site', async t => {
    await createTestSite()
    t.pass()
})


test('api/create-site - not unique url', async t => {

    const testUrl = createSiteUrl()

    await createTestSite({ overrideData: { url: testUrl } })

    try {
        await createTestSite({ overrideData: { url: testUrl } })
    } catch (e) {
        t.pass()
        return
    }

    t.fail()
})


test('api/fetch-my-sites - fetch-my-sites', async t => {

    const data = await createTestUser()

    const site1 = await (await createTestSite({ jwt: data.jwt })).site
    const site2 = await (await createTestSite({ jwt: data.jwt })).site

    // Delay the last one.
    await new Promise(r => setTimeout(r, 1200));
    const site3 = await (await createTestSite({ jwt: data.jwt })).site

    await new Promise(r => setTimeout(r, 1200));

    const res = await supertest(appLoaded)
        .post('/api/fetch-my-sites/')
        .set({
            authorization: data.jwt,
        })
        .send({
            // From now
            fromIso: new Date().toISOString(),
        })
        .expect(ok)

    const sites = res.body.sites as Site[]

    t.is(sites[0].uid === site3.uid, true)
    t.is(sites[1].uid === site2.uid, true)

    t.pass()
})


test('api/fetch-my-sites - fetch-my-sites - from iso', async t => {

    const data = await createTestUser()

    const site1 = await (await createTestSite({ jwt: data.jwt })).site
    await new Promise(r => setTimeout(r, 1500));
    const site2 = await (await createTestSite({ jwt: data.jwt })).site
    await new Promise(r => setTimeout(r, 1500));
    const site3 = await (await createTestSite({ jwt: data.jwt })).site

    const res = await supertest(appLoaded)
        .post('/api/fetch-my-sites/')
        .set({
            authorization: data.jwt,
        })
        .send({
            fromIso: site1.lastSiteUpdatedIso,
        })
        .expect(ok)

    const sites = res.body.sites as Site[]

    t.is(sites[0].uid === site1.uid, true)
    t.is(sites.length, 1)

    t.pass()
})


test('api/update-site - update the site', async t => {

    const data = await createTestUser()
    const site1 = await (await createTestSite({ jwt: data.jwt })).site

    const description = createDesc();

    const res = await supertest(appLoaded)
        .post('/api/update-site/')
        .set({
            authorization: data.jwt,
        })
        .send({
            siteToUpdateUid: site1.uid,
            description,
        })
        .expect(ok)

    const updateSite = res.body.site as Site

    t.is(updateSite.uid === site1.uid, true)
    t.is(updateSite.description === description, true)

    t.pass()
})


test('api/delete-site - delete site', async t => {

    const data = await createTestUser()
    const site1 = await (await createTestSite({ jwt: data.jwt })).site

    await supertest(appLoaded)
        .post('/api/delete-site/')
        .set({
            authorization: data.jwt,
        })
        .send({
            siteToDeleteUid: site1.uid,
        })
        .expect(ok)

    await supertest(appLoaded)
        .post('/api/fetch-site/')
        .set({
            authorization: data.jwt,
        })
        .send({
            siteUid: site1.uid,
        })
        .expect(error)

    t.pass()
})


test('api/delete-site - delete site, check pages', async t => {

    const data = await createTestUser()
    const site1 = await (await createTestSite({ jwt: data.jwt })).site

    const page1 = await (await createTestPage(site1.uid, { jwt: data.jwt, overrideData: {} })).page
    const page2 = await (await createTestPage(site1.uid, { jwt: data.jwt, overrideData: {} })).page

    // Delete the site
    await supertest(appLoaded)
        .post('/api/delete-site/')
        .set({
            authorization: data.jwt,
        })
        .send({
            siteToDeleteUid: site1.uid,
        })
        .expect(ok)

    // Test that there's no page
    await supertest(appLoaded)
        .post('/api/fetch-page-via-url/')
        .set({
            authorization: data.jwt,
        })
        .send({
            url: site1.url + '/' + page1.url,
        })
        .expect(error)

    // Test that there's no page
    await supertest(appLoaded)
        .post('/api/fetch-page-via-url/')
        .set({
            authorization: data.jwt,
        })
        .send({
            url: site1.url + '/' + page2.url,
        })
        .expect(error)

    t.pass()
})



test('api/check-site-url-unqiue', async t => {

    // Is not unique
    const site = (await createTestSite()).site;
    const testUrl = createSiteUrl()

    const res = await supertest(appLoaded)
        .post('/api/check-site-url-unqiue/')
        .send({
            url: site.url,
        })
        .expect(ok)
    t.is(res.body.isUnique, false)

    // Is unique
    const res2 = await supertest(appLoaded)
        .post('/api/check-site-url-unqiue/')
        .send({
            url: site.url + createUid(),
        })
        .expect(ok)
    t.is(res2.body.isUnique, true)
})

test('api/fetch-site-via-url', async t => {
    // Got page
    const site = await createTestSite();
    const res = await supertest(appLoaded)
        .post('/api/fetch-site-via-url/')
        .send({
            siteUrl: site.site.url,
        })
        .expect(ok)
    const gotSite = res.body.site as Site
    t.is(gotSite.name === site.site.name, true)
})

test('api/fetch-site-via-url - no site url', async t => {
    // Got page
    const site = await createTestSite();
    await supertest(appLoaded)
        .post('/api/fetch-site-via-url/')
        .send({
            siteUrl: site.site.url + createUid(),
        })
        .expect(error)
    t.pass()
})


test('api/create-site - User is flagged', async t => {
    const data = await createTestUser()
    await updateUser(data.user.uid, { isFlagged: true })
    await t.throwsAsync(createTestSite({ jwt: data.jwt }))
})



test('api/fetch-subscribed-sites - fetch subscribed sites.', async t => {

    const data = await createTestUser()

    const site1 = await createTestSite()
    const site2 = await createTestSite()
    const site3 = await createTestSite()

    await subscribeUserToSite(data.user.uid, site1.site.uid)
    await subscribeUserToSite(data.user.uid, site2.site.uid)
    await subscribeUserToSite(data.user.uid, site3.site.uid)

    const res = await supertest(appLoaded)
        .post('/api/fetch-subscribed-sites/')
        .set({
            authorization: data.jwt,
        })
        .expect(ok)

    const sites = res.body.sites as Site[]

    t.is(sites.length === 3, true)
})
