exports.handler = async (event) => {
    const { listCommand, createResourceCommand, removeResourceCommand } = await import('./commands.mjs');
    const { eventProcessor } = await import('./eventProcessor.mjs');
    let evenProcess = await eventProcessor(event)
    const response = {
        statusCode: 200,
        body: JSON.stringify('Lambda Function Completed.'),
    };
    return response;
};
