import { logger } from './src/utils/logger';
import * as express from 'express';
import routes from './src/routes/routes';
import * as cors from 'cors';
import { initMongo } from './src/utils/helpers-mongo'
import { loadConfig, getProjectId } from './src/utils/config';
import { initSMS } from './src/utils/helpers-sms'

const PORT = Number(process.env.PORT) || 8080;

export const init = async (): Promise<express.Express> => {

    try {
        await loadConfig();

        initSMS()

        await initMongo()

        const app = express();
        app.use(express.json({ limit: '150mb' }));
        app.use(express.urlencoded({ extended: true }));
        app.use(cors())

        app.get('/', (res, req) => {
            req.json({ status: "ok", projectId: getProjectId() });
        });

        app.use('/api', routes);

        app.use('/docs', express.static('docs'))

        app.listen(PORT, () => {
            logger.info(`App listening on port ${PORT}`);
        });
        return app;
    }

    catch (e) {
        console.error(e);
        throw e;
    }
}

export const isTestMode = (): boolean => {
    return !!process.env.TEST_MODE;
}

// We init differentely in test mode.
if (!isTestMode()) {
    init();
}
