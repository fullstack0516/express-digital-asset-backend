import { isDev } from './config';
import { Db, MongoClient } from "mongodb"
import { Config } from '../utils/config'

let mongo: MongoClient;
export let mongoDb: Db;

export let resultsCollection: Db;

export const collectionNames = {
    users: 'users',
    sites: 'sites',
    pages: 'pages',
    reports: 'pages.reports',
    pageHistory: 'pages.history',
    pageLikes: 'pages.likes',
    subscriptions: 'subscriptions',
    userDataTags: 'userDataTags',
    blacklistedUserCategories: 'blacklistedCategories',
    websiteStatus: 'websiteStatus'
}

export const initMongo = async () => {

    let connectionString = Config.monogUrl

    if (isDev()) {
        connectionString = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
    }

    mongo = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    mongoDb = mongo.db(Config.mongoDatabase)

    if (!mongo) {
        throw 'Could not connect to Mongo'
    }
}