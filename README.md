# Twingate Tag CloudWatch

Provides the ability to automatically create Twingate resources and adding group permission to these resources by monitoring the tagging of the AWS resources.


## Download The Latest Release
Download the latest ```Cloudformation.yaml``` and ```TgAwsTagWatchLmabda.zip``` at [Github Release](https://github.com/Twingate-Labs/tg-aws-tag-sync/releases/latest).

## Upload Lambda Function To AWS S3 Bucket
- Using an existing AWS S3 bucket or create a new one.
- Upload ```TgAwsTagWatchLambda.zip``` To the S3 Bucket

## Create New CloudFormation Stack
- Create a new CloudFormation Stack
- Using ```Cloudformation.yaml``` as the template
- Insert the following parameters
  - S3BucketName: The name of the S3 bucket, e.g. twingateTagWatchBucket
  - S3LambdaKey: Default value TgAwsTagWatchLmabda.zip unless the filename is changed
  - TwingateApiKey: The Twingate API key
  - TwingateNetworkAddress: The Twingate network address, e.g. exampleAccount.twingate.com

  
## How To Use
Tag an AWS resource with the following tags

| Tag                       | Input Format                                         | Twingate Action                                   | AWS Action                                             |
|---------------------------|------------------------------------------------------|---------------------------------------------------|--------------------------------------------------------|
| **ADD** tg_resource       | RemoteNetworkNameOrId++ResourceName++ResourceAddress | Create the resource in the Twingate               | adding tg_resource_id to the AWS resource tag          |
| **ADD** tg_groups         | GroupNameOrId1++GroupNameOrId2++GroupNameOrId3...    | Add the defined groups into the Twingate resource | None                                                   |
| **REMOVE** tg_resource_id | None                                                 | Remove the resource in the Twingate               | Remove tg_groups and tg_resource from AWS resource tag |


##  Supported AWS Resources

| AWS Resource           | Supported    |
|------------------------|--------------|
| EC2 Instance           | Yes          |
| ECS Cluster            | Yes          |
| ECS Service            | Yes          |
| ECS Task               | Yes          |
| ECS Container Instance | Yes          |
| ECS Instance           | No           |
| RDS Cluster            | No           |
| RDS Instance           | Yes          |