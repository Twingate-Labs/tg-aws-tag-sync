const { TwingateApiClient } = await import('./TwingateApiClient.mjs');

// @todo add options
export async function listCommand(name, networkName, apiKey) {
    const listCmdConfig = {
        "resource": {
            typeName: "Resource",
            fetchFn: "fetchAllResources",
            listFieldOpts: {
                groups: {
                    ignore: true
                }
            }
        },
        "device": {
            typeName: "Device",
            fetchFn: "fetchAllDevices",
            listFieldOpts: {
                users: {ignore: true},
                resources: {ignore: true}
            }
        },
        "group": {
            typeName: "Group",
            fetchFn: "fetchAllGroups",
            listFieldOpts: {
                users: {ignore: true},
                resources: {ignore: true}
            }
        },
        "user": {
            typeName: "User",
            fetchFn: "fetchAllUsers",
            listFieldOpts: {}
        },
        "network": {
            typeName: "RemoteNetwork",
            fetchFn: "fetchAllRemoteNetworks",
            listFieldOpts: {
                resources: {ignore: true}
            }
        },
        "connector": {
            typeName: "Connector",
            fetchFn: "fetchAllConnectors",
            listFieldOpts: {}
        },
        "service_account": {
            typeName: "ServiceAccount",
            fetchFn: "fetchAllServiceAccounts",
            listFieldOpts: {}
        }
    }
    let config = listCmdConfig[name];
    let client = new TwingateApiClient(networkName, apiKey);
    const configForCli = {
        defaultConnectionFields: "LABEL_FIELD",
        fieldOpts: {
            defaultObjectFieldSet: [TwingateApiClient.FieldSet.LABEL],
            ...config.listFieldOpts
        },
        joinConnectionFields: (connections) => {
            let s = connections.join(", ");
            return s.length > 50 ? s.substr(0, 50) + "..." : s;
        },
        recordTransformOpts: {
            mapDateFields: true,
            mapNodeToLabel: true,
            mapEnumToDisplay: true,
            flattenObjectFields: true
        }
    }
    let schema = TwingateApiClient.Schema[config.typeName];
    let records = await client[config.fetchFn](configForCli);


    return records
}

export async function createRemoteNetworkCommand(networkName, apiKey){

}

// @todo add options
export async function createResourceCommand(networkName, apiKey, remoteNetworkNameOrId, resourceName, resourceAddress, protocols) {
    let client = new TwingateApiClient(networkName, apiKey);

    // Lookup id from name if we need to
    let remoteNetworkId = remoteNetworkNameOrId;
    if (!remoteNetworkNameOrId.startsWith(TwingateApiClient.IdPrefixes.RemoteNetwork)) {
        remoteNetworkId = await client.lookupRemoteNetworkByName(remoteNetworkNameOrId);
        if (remoteNetworkId == null) throw new Error(`Could not find remote network: '${remoteNetworkNameOrId}'`);
    }


    let res = await client.createResource(resourceName, resourceAddress, remoteNetworkId, protocols, [])
    console.log(`added resources: {remote network: ${remoteNetworkNameOrId}, resource name: ${resourceName}, resource address: ${resourceAddress}, resource id: ${res.id}}`)

    return res
}

export async function removeResourceCommand(networkName, apiKey, resourceId) {
    let client = new TwingateApiClient(networkName, apiKey);
    let res = await client.removeResource(resourceId);
    console.log(`removed resource with ID [${resourceId}]`)
    return res
}


export async function addGroupToResource(networkName, apiKey, resourceNameOrId, groupNameOrId){
    let client = new TwingateApiClient(networkName, apiKey);

    let resourceId = resourceNameOrId
    if (!resourceNameOrId.startsWith(TwingateApiClient.IdPrefixes.Resource)) {
        resourceId = await client.lookupResourceByName(resourceNameOrId)}

    if (resourceId == null) {
        throw new Error(`Could not find resource: '${resourceId}'`)
    }


    let groupIds = groupNameOrId
    for ( let x = 0; x < groupIds.length; x++ ) {
        let groupId = groupIds[x]
        if (!groupId.startsWith(TwingateApiClient.IdPrefixes.Group)) {
            groupId = await client.lookupGroupByName(groupId);
            if (groupId == null) {
                throw new Error(`Could not find group: '${groupNameOrId}'`)
            } else {
                groupIds[x] = groupId
            }
        }
    }

    let res = await client.addGroupToResource(resourceId, groupIds)
    console.log(`added groups with ID ${groupIds} to resource with ID ${resourceId}`)
    return res
}
