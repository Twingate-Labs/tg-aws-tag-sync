exports.handler = async (event) => {
    const { eventProcessor } = await import('./eventProcessor.mjs');
    let evenProcess = await eventProcessor(event)
    const response = {
        statusCode: 200,
        body: JSON.stringify('Lambda Function Completed.'),
    };
    return response;
};
