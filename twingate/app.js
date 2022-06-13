exports.handler = async (event) => {
    const { listCommand, createResourceCommand, removeResourceCommand } = await import('./commands.mjs');
    const { eventProcessor } = await import('./eventProcessor.mjs');
    let test123 = await eventProcessor(event)
    // let networkName = "chenstaging.stg.opstg.com"
    // let apiKey = "YHmlwP5KtILN3BgY94sPUSPRgMFHxQ-JgFuhtBswRBoc5gu4xJv54zUBB0OH2mJ2mCx7LxO78JVNweLpRL7tP1gz6bjNXC3UjeyDiGU8sKe1YVsRBsocBqlcAptoAMZFqXbIlQ"
    // // let name = "resource"
    // let remoteNetworkNameOrId = "123"
    // let resourceName = "lambda_test_2"
    // let resourceAddress = "1.1.1.1"
    // let groupNamesOrIds = "lambda_test"
    // let resourceId = "UmVzb3VyY2U6MzU5MzY1"

    // let output = await listCommand(name, networkName, apiKey)
    //
    // let output = await createResourceCommand(networkName, apiKey, remoteNetworkNameOrId, resourceName, resourceAddress, groupNamesOrIds)

    // let output = await removeResourceCommand(networkName, apiKey, resourceId)


    // let str = JSON.stringify(output)
    // console.log("-------")
    // console.log(str)

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
