import { ContentImageRow } from './../models/content-section';
import { deleteSite, fetchSiteViaUrl } from './../utils/helpers-sites';
import { createTestPage } from './pages.test';
import test from 'ava';
import { createTestUser, ok, appLoaded, uploadPhotoForTest } from './index.test';
import * as supertest from 'supertest';
import Site from '../models/site';
import ContentSection from '../models/content-section';
import { createTestSite } from './sites.test';
import { User } from '../models/user';

// Sites
export const classicCarsSiteUrl = 'classic-cars'
export const healthAndFitnessSiteUrl = 'all-about-health-and-fitness-body-temple';

// Pages
export const landRoverPageUrl = 'land-rover-in-madeira';
export const porschePageUrl = 'unique-porsche-550-spyder-looking-a-new-wing-man'
export const coffeePageUrl = 'reasons-stop-drinking-coffee';


// test('create-dummy-user', async t => {

//     const data = await createTestUser()
//     const user = data.user;
//     const jwt = data.jwt;

//     // Create some fake sites.
//     await asyncForEach(new Array(50).fill(0), async o => {
//         const site = await createTestSite({ jwt })

//         // Each site has some fake pages.
//         await asyncForEach(new Array(50).fill(0), async o => {
//             const page = await createTestPage(site.site.uid, { jwt })

//             // Each page has random test content
//             await asyncForEach(new Array(3).fill(0), async o => {
//                 await createRandomTestContent(page.page.uid, jwt)
//             })
//         })
//     })

//     // TODO Create dummy data points for user.After datapoint tests.
//     // TODO Scan sites.

//     console.log({ fakeNumber: user.phoneNumber })
// })



export const createTextBlock = async (pageUid: string, jwt: string, contentType: 'header' | 'text-block', text: string) => {
    const textRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid: pageUid,
            contentSectionType: contentType,
        })
        .expect(ok)
    const contentSection = textRes.body.contentSection as ContentSection<any>
    // Update the header text
    await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid: pageUid,
            contentSectionUid: contentSection.uid,
            newText: text,
        })
        .expect(ok)
}

const createImageRow = async (pageUid: string, jwt: string, fileUrl: string) => {
    const imageRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: jwt
        })
        .send({
            pageUid: pageUid,
            contentSectionType: 'image-row',
        })
        .expect(ok)
    const contentSection = imageRes.body.contentSection as ContentSection<ContentImageRow>
    // Update the image block
    await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid: pageUid,
            contentSectionUid: contentSection.uid,
            newImageUrl: await uploadPhotoForTest(fileUrl),
        })
        .expect(ok)
}

const createImageWithText = async (pageUid: string, jwt: string, type: 'text-image-left' | 'text-image-right', fileUrl: string, text: string) => {
    const imageWithTextBlockRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: jwt
        })
        .send({
            pageUid: pageUid,
            contentSectionType: type,
        })
        .expect(ok)
    const imageWithTextBlockContent = imageWithTextBlockRes.body.contentSection as ContentSection<any>
    // Update text block
    await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: jwt
        })
        .send({
            pageUid: pageUid,
            contentSectionUid: imageWithTextBlockContent.uid,
            newImageUrl: await uploadPhotoForTest(fileUrl),
            newText: text,
        })
        .expect(ok)
}

const createDummySiteClassicalCars = async (jwt: string): Promise<Site> => {

    // Delete the site first.
    try {
        const existingSite = await fetchSiteViaUrl(classicCarsSiteUrl)
        await deleteSite(existingSite.uid)
    } catch (e) {
        console.log(e);
    }

    // Create the site
    const sendData = {
        ...{
            name: 'Classic Cars',
            siteIcon: {
                type: 'photo',
                url: (await uploadPhotoForTest(`${__dirname}/test-assets/dummy-sites-content/classic_cars_logo.png`)),
            },
            siteColor: '#FF0000',
            description: 'This is a site about classic cars, usually cars that 20 years or older.',
            url: classicCarsSiteUrl,
        },
    }

    const site = await (await createTestSite({ jwt, overrideData: sendData })).site;

    // Land Rover page
    const page1 = await createTestPage(site.uid, {
        jwt,
        overrideData: {
            url: landRoverPageUrl,
            title: 'Land Rover in Madeira',
        }
    })
    // Add blocks
    await createTextBlock(page1.page.uid, jwt, 'header', 'There’s no such thing as bad weather for driving a Land Rover in Madeira')
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'Madeira is the island with the highest density of classic Land Rovers per square metre in the world. The passion for classic Landies also runs deep for Martim Noronha and his family, who own a beautiful 1959 Series 1. Photographer Bartek Kołaczkowski joined him in the cabin for a chat. Rising from a massive submerged volcano along the African plate in the Atlantic, a good 900 kilometres from the Moroccan coast, the Madeira Archipelago is one of the wildest and most remote places in the western world – and a haven for Land Rover enthusiasts. The iconic and near-indestructible British off-roaders are perfect for exploring the islands’ rugged, rocky mountains, roaming their deep rainforests or just sitting out one of their trademark downpours. Like many locals, Martim’s family has maintained a passion for classic Landies for three generations. Here’s what he told us during a drive in his 1959 Series 1.')
    await createImageRow(page1.page.uid, jwt, `${__dirname}/test-assets/dummy-sites-content/land_rover_1.jpg`)
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'Where does the passion for old Land Rovers come from?  From my dad, who got me into classic cars. And as for my dad, I’m sure he got the bug from my grandfather! He was a doctor who emigrated to Curaçao in the Caribbean to work for Shell. When he returned to Madeira, he ordered two cars: a Land Rover Series 2A for himself and a Mercedes 180 for my grandmother.  My uncle still owns the Mercedes and my father owns the Series 2A. The Land Rover was ordered from the factory in the UK and the Mercedes from the factory in Germany. Both were delivered to my grandfather and he and my grandmother used them during their life in Madeira.”')
    await createImageWithText(page1.page.uid, jwt, 'text-image-left', `${__dirname}/test-assets/dummy-sites-content/land_rover_2.jpg`, '“My father had a Series I with a petrol engine before this one with a diesel. He sold his first in order to buy another car. But he loved itso much that he bought this one from someone in mainland Portugal. It worked fine for a while, but after it blew a head gasket, my father undertook a full restoration.”')
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'How can a 1959 car be a Series I, since that was when the Series 2 went into production?“All Series 1s have a license plate in front of the mudguard, while all the following series have it front and centre. Ours already had the front-and-centre license plate, which can usually only be seen on Series 2 onwards.“We believe ours was a ‘transition’ car; there’s just no other explanation. The Series 1 ended in 1958 (my father’s birth year), but ours is from 1959 and has the shape of a Series 1 and an engine that the British say is original to this car – but of a type only used in the Series 2.')
    await createImageRow(page1.page.uid, jwt, `${__dirname}/test-assets/dummy-sites-content/land_rover_3.jpg`)
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'That\'s interesting!  “We believe that at the time, the factory still had some Series 1 parts, so they had a left-hand-drive chassis that they assembled with these parts and shipped to Portugal. At the time this was unimportant, as Series 1s were mainly used for agricultural work and this wouldn’t affect that.  “The Land Rover Owners’ Club in the UK considers the engine in our Series 1 to be original. As for the chassis, it’s clearly a Series 1, but with a Series 2 number, so the club considers our car a Series 2.”')
    // Publish The page and get the tags.
    await supertest(appLoaded)
        .post('/api/page-section-publish')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid: page1.page.uid,
        })


    // Porsche 550 Page
    const page2 = await createTestPage(site.uid, {
        jwt,
        overrideData: {
            url: porschePageUrl,
            title: 'This unique Porsche 550 Spyder is looking for a new wing man',
        }
    })
    // Add blocks
    await createTextBlock(page2.page.uid, jwt, 'header', 'This unique Porsche 550 Spyder is looking for a new wing man')
    await createTextBlock(page2.page.uid, jwt, 'text-block', 'There are some cars that are so instantly recognisable and important that they are a passport to potentially life changing events. This 1955 Porsche 550 Spyder is one of them.')
    await createImageRow(page2.page.uid, jwt, `${__dirname}/test-assets/dummy-sites-content/porsche_1.jpg`)
    await createTextBlock(page2.page.uid, jwt, 'text-block', 'We featured the car last summer in an article by Classic Driver regular Remi Dargegen, and today the car is offered up to a new lucky custodian by Simon Kidston. The headlines are remarkable: six world records set at Montlhéry in 1955, entered at the infamous, 1955 24 Hours of Le Mans, 1956 Nürburgring 1000km and many more historical races.  The 1956 Nürburgring 1000kms is the important one though, as engineer Michael May took ownership of the Porsche and had a crazy idea: “I wanted to get into racing and already had a wing in my mind. I was always crazy. A 550 was by far the best way to get into top competition. I needed a basic car I could make faster in corners and under braking.”')
    await createImageRow(page2.page.uid, jwt, `${__dirname}/test-assets/dummy-sites-content/porsche_2.jpg`)
    await createTextBlock(page2.page.uid, jwt, 'text-block', 'Directly bolting a NACA 6412- profile wing to the chassis rails and mounted in the middle of the car. Too many it was amusing, that is until it ventured out on the to fearsome Nordschleife where the car was lapping four seconds quicker than the factory entered Porsches. Cleverly the wing could be adjusted form the cockpit allowing the driver to reduce drag on the faster sections and then adjust the angle to create significant down force where required.')
    await createImageRow(page2.page.uid, jwt, `${__dirname}/test-assets/dummy-sites-content/porsche_3.jpg`)
    await createTextBlock(page2.page.uid, jwt, 'text-block', 'Offered for sale by its current owner of four years via Simon Kidston, this car is a hugely important piece of motoring history, proven by its invites and awards that it has received at the world’s greatest automotive events in recent years. Is there a more desirable car that is currently for sale that would gain you access to so many fantastic evens all over the globe? We don’t think so.')
    // Publish The page and get the tags.
    await supertest(appLoaded)
        .post('/api/page-section-publish')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid: page2.page.uid,
        })
        .expect(ok)

    return site;
}


const createDummySiteHealthAndFitness = async (jwt: string): Promise<Site> => {

    // Delete the site first.
    try {
        const existingSite = await fetchSiteViaUrl(healthAndFitnessSiteUrl)
        await deleteSite(existingSite.uid)
    } catch (e) {
        console.log(e);
    }

    // Create the site
    const sendData = {
        ...{
            name: 'All About Health And Fitness Body Temple',
            siteIcon: {
                type: 'photo',
                url: (await uploadPhotoForTest(`${__dirname}/test-assets/dummy-sites-content/health_site_logo.png`)),
            },
            siteColor: '#FF0000',
            description: 'Site about health and fitness and how you should respect your body as a temple.',
            url: healthAndFitnessSiteUrl,
        },
    }

    const site = await (await createTestSite({ jwt, overrideData: sendData })).site;

    // Qutting coffee page
    const page1 = await createTestPage(site.uid, {
        jwt,
        overrideData: {
            url: coffeePageUrl,
            title: '9 Reasons to Stop Drinking Coffee Immediately',
        }
    })
    // Add blocks
    await createTextBlock(page1.page.uid, jwt, 'header', '9 Reasons to Stop Drinking Coffee Immediately')
    await createImageRow(page1.page.uid, jwt, `${__dirname}/test-assets/dummy-sites-content/coffee_1.jpeg`)
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'Today’s article is all about caffeine, the thing that we all love and enjoy. We’re going to get into a little bit more detail about caffeine, and some of the best reasons to stop drinking coffee immediately.  **What happens when we drink coffee?**  Within **10 minutes** of drinking coffee, caffeine enters your bloodstream, and your blood pressure and heart rate begin to rise.  After **20 minutes**, you begin to become more alert, and your concentration levels start to improve. Hence why people who drink coffee love the stuff so much.  Within **30 minutes**, your athletic ability is improved by increased motor neuron efficiency.  Within **12 hours**, things are back to normal, and after 12 hours, your body starts to get withdrawal symptoms from not consuming any more caffeine.  This awesome infographic explains the process in more detail.  But, more importantly… let’s move on to the reason why you clicked on this article.')
    await createTextBlock(page1.page.uid, jwt, 'header', '9 Reasons to Stop Drinking Coffee')
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'Let’s get into it!')
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'Here are some of the best reasons to stop drinking coffee or caffeine completely. There are many healthy alternatives to coffee that still contain caffeine. For example, I drink green tea regularly, which has a much lower amount of caffeine, and can also be very good for you.  Anyway, here are the reasons to quit coffee')
    await createTextBlock(page1.page.uid, jwt, 'text-block', '**1. Caffeine Can Reduce the Quality of Your Sleep**  Obviously we know caffeine is a natural stimulant for the brain, but this will have an affect on our sleeping patterns and the quality of sleep we get.  Even if you don’t drink coffee before you go to sleep, it can still have an affect the amount of solid sleep you get.  Those who have stopped drinking caffeine have often seen improvements in the quality of sleep they get every night. In turn, this leaves them naturally more rested for the next day ahead.')
    await createTextBlock(page1.page.uid, jwt, 'text-block', 'And so actually, after reading the next point I’m about to explain, you’ll see why coffee can actually give you less energy than usual.  This point on reduced quality of sleep, combined with the next point really shows how detrimental caffeine can be to your energy levels.')
    await createTextBlock(page1.page.uid, jwt, 'text-block', '**2. After Time, Coffee Doesn’t Give You Any More Energy**  Many of us drink coffee everyday because we need our extra boost of energy in the mornings to get us through the day. However, after time, our bodies build a tolerance to this, and we really don’t see any more energy benefits from drinking coffee every day.  If you stop drinking coffee for a while, and then have a cup of the stuff every now and again afterwards, you’ll experience the energy boosting benefits once again.  So for anyone who’s drinking coffee everyday purely because you think it’s giving you more energy, it’s most likely not having any real affect on your energy levels.')
    await createTextBlock(page1.page.uid, jwt, 'text-block', '3. It’s Healthy to Beat the Addiction of Caffeine  Relying on any substance is a risky thing. Obviously the worse the substance the more serious the issue is. Illegal drugs are clearly some of the worst possible cases of addiction. However, having an addiction for any substance is not healthy.  If you’re addicted to coffee, and you rely on it every single day, it’s not healthy. Beating any addiction will give you more freedom and power over yourself.')
    await createTextBlock(page1.page.uid, jwt, 'text-block', '**4. You Can Save A Lot of Money by Quitting Coffee**  For most of the working world, in particular those solo entrepreneurs reading this and living the laptop lifestyle, coffee can become an expensive habit.  It\'s very easy to go and work in Starbucks, and get through a couple of cups. Maybe you\'re not a laptop entrepreneur but you work in a building close by to some of your favorite coffee shops.  Making a visit there every break or lunch you get quickly racks up. Drinking it at home is obviously less expensive, but most people prefer to drink out. So if you’re trying to keep an eye on your bills, maybe cut back on the daily trip to Starbucks.')
    // Publish The page and get the tags.
    await supertest(appLoaded)
        .post('/api/page-section-publish')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid: page1.page.uid,
        })
        .expect(ok)


    return site;
}


export const createDummyContent = async (): Promise<User> => {
    const userData = await createTestUser()

    await createDummySiteClassicalCars(userData.jwt)
    await createDummySiteHealthAndFitness(userData.jwt)

    console.log('\x1b[36m%s\x1b[0m', 'User phone number was: ' + userData.user.phoneNumber)

    return userData.user;
}


// test('create-dummy-site - Classic cars and health', async t => {
//     await createDummyContent();
//     t.pass()
// })
