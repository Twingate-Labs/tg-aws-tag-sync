import { eventProcessor } from './eventProcessor.mjs';

export async function handler(event) {

    let evenProcess = await eventProcessor(event)
    const response = {
        statusCode: 200,
        body: JSON.stringify('Lambda Function Completed.'),
    };
    return response;
};
