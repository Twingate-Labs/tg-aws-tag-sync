import {getAwsResourceInfo} from "./util.mjs";
const { listCommand, createResourceCommand, removeResourceCommand, addGroupToResourceCommand } = await import('./commands.mjs');
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import {ResourceGroupsTaggingAPIClient, TagResourcesCommand, UntagResourcesCommand} from "@aws-sdk/client-resource-groups-tagging-api";

const ssmClient = new SSMClient()
const ssmInput = { "Names": ["TwingateApiKey", "TwingateNetworkAddress"] , "WithDecryption": true}
const ssmCommand = new GetParametersCommand(ssmInput)
const ssmParameter = await ssmClient.send(ssmCommand) // top-level await
const networkAddress = ssmParameter.Parameters.find(x => x.Name === 'TwingateNetworkAddress').Value
const apiKey =  ssmParameter.Parameters.find(x => x.Name === 'TwingateApiKey').Value


export async function eventProcessor(event) {

    let [remoteNetworkName, resourceName, resourceAddress, resourceId, resourceInfo] = ["", "", "", ""]

    if (event.detail.service=="rds" && event.detail["resource-type"]=="cluster"){
        throw new Error(`RDS cluster is not supported`)
    }
    // if tg_groups tag is added but tg_resource does not exist
    if (event.detail["changed-tag-keys"].includes("tg_groups") && ("tg_groups" in event.detail.tags) && !("tg_resource" in event.detail.tags) && !(event.detail["changed-tag-keys"].includes("tg_resource"))){
        throw new Error(`tg_resource tag is not found`)
    }

    // process tg_resource tag
    if ("tg_resource" in event.detail.tags){
        resourceInfo = event.detail.tags.tg_resource.replace(/\s*\+\+\s*/g, "++").split("++")
        if (resourceInfo.length == 3){
            [remoteNetworkName, resourceName, resourceAddress] = resourceInfo
        } else {
            console.log(`Twingate resource name and/or address is not found in the AWS tag 'tg_resource', trying to populate them using AWS resource name and resource private Ip`)
            remoteNetworkName = resourceInfo[0]
            let awsResourceId = event.resources[0].split("/")[event.resources[0].split("/").length-1]
            let awsResouceType = event.detail.service + event.detail["resource-type"]
            let awsResourceInfo = await getAwsResourceInfo(awsResourceId, awsResouceType, resourceInfo.length)
            let awsResourceName = awsResourceInfo.instanceName
            let awsResourceIp = awsResourceInfo.instanceIp
            switch (resourceInfo.length){
                case 1:
                    resourceName = awsResourceName
                    resourceAddress = awsResourceIp
                    console.log(`Using AWS resource name '${resourceName}' as the Twingate resource name`)
                    console.log(`Using AWS resource private IP '${resourceAddress}' as the Twingate resource address`)
                    break
                case 2:
                    resourceName = resourceInfo[1]
                    resourceAddress = awsResourceIp
                    console.log(`Using AWS resource private IP '${resourceAddress}' as the Twingate resource address`)
                    break
                default:
                    throw new Error(`tg_resource tag is in the wrong format, ${event.detail.tags.tg_resource}.`)
            }
        }
    }


    // check if tg_resource tag is added (not removed)
    if (event.detail["changed-tag-keys"].includes("tg_resource")){
        if ("tg_resource" in event.detail.tags){
            let output = await createResourceCommand(networkAddress, apiKey, remoteNetworkName, resourceName, resourceAddress, null)
            resourceId = output.id
            //todo: handle multiple resources. create multiple resources and add groups to the resources
            const resourceArn = event.resources
            let tagInput = {
                "ResourceARNList": resourceArn,
                "Tags": {
                    "tg_resource_id": resourceId,
                }
            }

            // @todo: this would trigger another event, need another way to improve this
            // if (resourceInfo.length != 3){
            //     tagInput = {
            //         "ResourceARNList": resourceArn,
            //         "Tags": {
            //             "tg_resource_id": resourceId,
            //             "tg_resource": `${remoteNetworkName}++${resourceName}++${resourceAddress}`
            //         }
            //     }
            // }

            const tagClient = new ResourceGroupsTaggingAPIClient()
            const tagCommand = new TagResourcesCommand(tagInput)
            const tagResponse = await tagClient.send(tagCommand)
            if (Object.keys(tagResponse.FailedResourcesMap).length==0) {
                console.log(`Added Tag 'tg_resource_id' to the AWS resource '${resourceArn}'`)
            } else {
                console.warn(`Failed to add 'tg_resource_id' to the AWS resource '${resourceArn}'. Responds from AWS: '${JSON.stringify(tagResponse)}'`)
            }

        } else {
            console.log("tg_resource tag is removed, nothing to do.")
        }

    }

    if (event.detail["changed-tag-keys"].includes("tg_groups")){
        if ("tg_groups" in event.detail.tags){
            resourceName = event.detail.tags.tg_resource_id || resourceId || resourceName
            let groupInfo = event.detail.tags.tg_groups.replace(/\s*\+\+\s*/g, "++").split("++")
            let output = await addGroupToResourceCommand(networkAddress, apiKey, resourceName, groupInfo)
        } else{
            console.log("tg_groups tag is removed, nothing to do.")
        }

    }

    if (event.detail["changed-tag-keys"].includes("tg_resource_id")){
        if (!("tg_resource_id" in event.detail.tags)){
            const resourceArn = event.resources
            const tagInput = {
                "ResourceARNList": resourceArn,
                "TagKeys": ["tg_resource", "tg_groups"]
            }
            const tagClient = new ResourceGroupsTaggingAPIClient()
            const tagCommand = new UntagResourcesCommand(tagInput)
            const tagResponse = await tagClient.send(tagCommand)
            let output = await removeResourceCommand(networkAddress, apiKey, resourceName)
        } else{
            console.log("tg_resource_id tag is added or modified, nothing to do.")
        }

    }
}
