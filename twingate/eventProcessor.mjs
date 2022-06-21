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
    let [remoteNetworkName, resourceNameOrId, resourceAddress, resourceId] = ["", "", "", ""]

    // process tg_resource tag
    if ("tg_resource" in event.detail.tags){
        let resourceInfo = event.detail.tags.tg_resource.replace(/\s*,\s*/g, "++").split("++")
        if (resourceInfo.length == 3){
            [remoteNetworkName, resourceNameOrId, resourceAddress] = resourceInfo
        }else {
            throw new Error(`tg_resource tag is in the wrong format, ${event.detail.tags.tg_resource}.`)
        }
    }


    // check if tg_resource tag is added (not removed)
    if (event.detail["changed-tag-keys"].includes("tg_resource")){
        if ("tg_resource" in event.detail.tags){
            let output = await createResourceCommand(networkAddress, apiKey, remoteNetworkName, resourceNameOrId, resourceAddress, null)
            resourceId = output.id
            //todo: handle multiple resources. create multiple resources and add groups to the resources
            const resourceArn = event.resources
            const tagInput = {
                "ResourceARNList": resourceArn,
                "Tags": {
                    "tg_resource_id": resourceId,
                }
            }
            const tagClient = new ResourceGroupsTaggingAPIClient()
            const tagCommand = new TagResourcesCommand(tagInput)
            const tagResponse = await tagClient.send(tagCommand);
            console.log(`Added Tag 'tg_resource_id' to AWS resource '${resourceArn}'`)
        } else {
            console.log("tg_resource tag is removed, nothing to do.")
        }

    }

    if (event.detail["changed-tag-keys"].includes("tg_groups")){
        if ("tg_groups" in event.detail.tags){
            resourceNameOrId =   event.detail.tags.tg_resource_id || resourceId
            let groupInfo = event.detail.tags.tg_groups.replace(/\s*,\s*/g, ",").split(",")
            let output = await addGroupToResourceCommand(networkAddress, apiKey, resourceNameOrId, groupInfo)
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
            let output = await removeResourceCommand(networkAddress, apiKey, resourceNameOrId)
        } else{
            console.log("tg_resource_id tag is added, nothing to do.")
        }

    }
}
