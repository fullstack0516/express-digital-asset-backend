import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, createTestUser, ok } from './index.test';
import { updateUser } from '../utils/helpers-users';
import { updatePage } from '../utils/helpers-pages';
import Page from '../models/page';
import { createTestSite } from './sites.test';
import { createTestPage } from './pages.test';

test('api/admin-fetch-flagged-pages - Fetch flagged pages', async t => {

    const data = await createTestUser()
    await updateUser(data.user.uid, { isAdmin: true })

    const site1 = (await createTestSite({ jwt: data.jwt })).site

    const page1 = (await createTestPage(site1.uid)).page
    await updatePage(page1.uid, { isFlagged: true })

    const res = await supertest(appLoaded)
        .post('/api/admin-fetch-flagged-pages/').set({
            authorization: data.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].isFlagged, true)
    t.is(pages[0].uid === page1.uid, true)
    t.is(pages.length > 0, true)
})
