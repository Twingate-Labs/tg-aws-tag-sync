import {EC2Client, DescribeInstancesCommand} from "@aws-sdk/client-ec2"


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
        default:
            throw new Error(`Auto Filling Twingate resource name and address is not supported for AWS resrouce type '${awsResouceType}'`)
    }
    return {instanceName, instanceIp}

}