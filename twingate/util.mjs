import {EC2Client, DescribeInstancesCommand} from "@aws-sdk/client-ec2"
import {ECSClient, DescribeTasksCommand} from "@aws-sdk/client-ecs"
import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds"

export async function getAwsResourceInfo(awsResourceId, awsResouceType, resourceInfoLength) {
    let [instanceName, instanceIp] = ["", ""]
    switch (awsResouceType){
        case "ec2instance":
            const ec2Params = {
                InstanceIds: [
                    awsResourceId
                ]
            }

            const ec2Client = new EC2Client()
            const ec2Command = new DescribeInstancesCommand(ec2Params)
            const ec2Response = await ec2Client.send(ec2Command)
            instanceIp = ec2Response.Reservations[0].Instances[0].PrivateIpAddress
            try {
                instanceName = ec2Response.Reservations[0].Instances[0].Tags.filter(i => "Name".includes(i.Key))[0].Value
            } catch(error){
                instanceName = instanceIp
                if (resourceInfoLength == 1){
                console.log(`Instance Name not found, using instance IP '${instanceIp}' as the resource name`)
                }
            }
            break
        case "ecstask":
            const ecsParams = {
                tasks: [
                    awsResourceId
                ]
            }
            const ecsClient = new ECSClient();
            const ecsCommand = new DescribeTasksCommand(ecsParams);
            const ecsResponse = await ecsClient.send(ecsCommand);
            instanceIp = ecsResponse.tasks[0].attachments[0].details.filter(i => "privateIPv4Address".includes(i.name))[0].value
            instanceName = `${ecsResponse.tasks[0].group} - ${ecsResponse.tasks[0].taskDefinitionArn.split("/")[ecsResponse.tasks[0].taskDefinitionArn.split("/").length-1]} - ${instanceIp}`
            break
        case "rdsdb":
            const rdsParams = {
                DBInstanceIdentifier: awsResourceId
            }
            const rdsClient = new RDSClient();
            const rdsCommand = new DescribeDBInstancesCommand(rdsParams);
            const rdsResponse = await rdsClient.send(rdsCommand);
            instanceIp = rdsResponse.DBInstances["0"].Endpoint.Address
            instanceName = rdsResponse.DBInstances[0].DBName || rdsResponse.DBInstances[0].DBInstanceIdentifier
            break
        default:
            throw new Error(`Auto Filling Twingate resource name and address is not supported for AWS resrouce type '${awsResouceType}'`)
    }
    return {instanceName, instanceIp}

}