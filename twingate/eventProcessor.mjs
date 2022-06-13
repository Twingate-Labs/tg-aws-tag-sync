const { listCommand, createResourceCommand, removeResourceCommand, addGroupToResource } = await import('./commands.mjs');
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import {ResourceGroupsTaggingAPIClient, TagResourcesCommand} from "@aws-sdk/client-resource-groups-tagging-api";

const ssmClient = new SSMClient()
const ssmInput = { "Names": ["TwingateApiKey", "TwingateNetworkAddress"] , "WithDecryption": true}
const ssmCommand = new GetParametersCommand(ssmInput)
const ssmParameter = await ssmClient.send(ssmCommand) // top-level await
const networkAddress = ssmParameter.Parameters.find(x => x.Name === 'TwingateNetworkAddress').Value
const apiKey =  ssmParameter.Parameters.find(x => x.Name === 'TwingateApiKey').Value


export async function eventProcessor(event) {
    let [remoteNetworkName, resourceNameOrId, resourceAddress] = ["", "", ""]

    // process tg_resource tag
    if ("tg_resource" in event.detail.tags){
        let resourceInfo = event.detail.tags.tg_resource.replace(/\s*,\s*/g, ",").split(",")
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
            let resourceId = output.id
            //todo: handle multiple resources. create multiple resources and add groups to the resources
            let resourceArn = event.resources
            const tagInput = {
                "ResourceARNList": resourceArn,
                "Tags": {
                    "tg_resource_id": resourceId,
                }
            }

            const tagClient = new ResourceGroupsTaggingAPIClient()
            const tagCommand = new TagResourcesCommand(tagInput)
            const tagResponse = await tagClient.send(tagCommand);
            console.log(tagResponse)
        } else {
            console.log("tg_resource tag is removed, nothing to do.")
        }

    }

    if (event.detail["changed-tag-keys"].includes("tg_groups")){
        if ("tg_groups" in event.detail.tags){
            resourceNameOrId =   event.detail.tags.tg_resource_id || resourceNameOrId
            let groupInfo = event.detail.tags.tg_groups.replace(/\s*,\s*/g, ",").split(",")
            let output = await addGroupToResource(networkAddress, apiKey, resourceNameOrId, groupInfo)
        } else{
            console.log("tg_groups tag is removed, nothing to do.")
        }

    }
}
