import * as SecretManagerServiceClient from "@google-cloud/secret-manager";
const client = new SecretManagerServiceClient.v1.SecretManagerServiceClient();

export let Config: ConfigI;

export const loadConfig = async (): Promise<ConfigI> => {
    console.log("Loaded project id: " + getProjectId());

    const secrets = await client.accessSecretVersion({
        name: `projects/${getProjectId()}/secrets/config/versions/latest`,
    });

    const payload = JSON.parse(secrets[0].payload.data.toString());
    Config = payload;

    // @ts-ignore
    return Config;
}

export interface ConfigI {
    productName: string;
    storageBucket: string;
    googleCloudApiKey: string;
    jwtSecret: string;
    emailSecret: string;
    dummyProfilePhotos: Array<string>;
    monogUrl: string;
    mongoDatabase: string;
    nodemailerConfig: {
        email: string;
        password: string;
        service: string;
    },
    sms: {
        vontageKey: string;
        vontageSecret: string;
    }
}

export const isProduction = () => {
    return process.env.NODE_ENV === "production";
};

export const isDev = () => {
    return process.env.NODE_ENV === "dev";
};

export const getProjectId = () => {
    return process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCP_PROJECT;
};
