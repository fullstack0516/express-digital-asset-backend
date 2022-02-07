import Nexmo, { CheckResponse, RequestResponse, VerifyError } from 'nexmo';
const NexmoCon = require('nexmo');
import { Config } from './config';
import { RouteError } from '../utils/route-error';

let nexmo: Nexmo;

export const initSMS = () => {
    nexmo = new NexmoCon({
        apiKey: Config.sms.vontageKey,
        apiSecret: Config.sms.vontageSecret,
    });
};

interface ExtendedNexmoRequestResponse extends RequestResponse {
    error_text?: string
}

interface ExtendedNexmoCheckResponse extends CheckResponse {
    error_text?: string
}

/**
 * Return the verification id needed.
 */
export const sendSMSCode = async (phoneNumber: string): Promise<string> => {
    const result = await new Promise(
        async (resolve: (value: ExtendedNexmoRequestResponse) => void, reject: (value: VerifyError) => void) => {
            await nexmo.verify.request(
                {
                    number: phoneNumber,
                    brand: `${Config.productName}`,
                    code_length: 4,
                    workflow_id: 6,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                }
            );
        }
    );

    // success
    if (result.status === '0') {
        return result.request_id;
    }
    // invalid phone number
    if (result.status === '3') {
        throw new RouteError('invalid-number', 'Invalid Phone number');
    }
    // concurrent verification to the same number
    if (result.status === '10') {
        throw new RouteError('concurrent-send-sms', 'Concurrent verifications to the same number are not allowed');
    }

    throw new RouteError('send-smscode-failed', result.error_text);

};

export const confirmSMS = async (code: string, verificationId: string) => {
    const result = await new Promise(
        async (resolve: (value: ExtendedNexmoCheckResponse) => void, reject: (value: VerifyError) => void) => {
            await nexmo.verify.check(
                {
                    request_id: verificationId,
                    code,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                }
            );
        }
    );
    // success
    if (result.status === '0') {
        return true;
    }
    // incorrect code or code was expired
    if (result.status === '16') {
        throw new RouteError('sms-code-incorrect', 'The code provided does not match the expected value');
    }

    throw new RouteError('sms-confirm-failed', result.error_text);
};
