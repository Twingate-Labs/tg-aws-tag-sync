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

**Note: The API Key is stored as String in the parameter store.**
  
## How To Use
Tag an AWS resource with the following tags

| Supported Actions           | Input Format                                                                                                                                                                                                     | Twingate Action                                                                                                              | AWS Action                                             |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| **ADD** tg_resource         | RemoteNetworkNameOrId++ResourceName++ResourceAddress <br/> RemoteNetworkNameOrId++ResourceName (Auto Filling Resource Address)<br/> RemoteNetworkNameOrId(Auto Filling  Resource Name and Resource Address)<br/> | Create the resource in the Twingate (the defined remote network need to exist in the Twingate)                               | adding tg_resource_id to the AWS resource tag          |
| **ADD** tg_groups           | GroupNameOrId1++GroupNameOrId2++GroupNameOrId3...                                                                                                                                                                | Add the defined groups into the Twingate resource (tg_resource should exist on the AWS resource before adding tg_groups tag) | None                                                   |
| **REMOVE** tg_resource_id   | None                                                                                                                                                                                                             | Remove the resource in the Twingate                                                                                          | Remove tg_groups and tg_resource from AWS resource tag |
| **MODIFY** tg_groups        | ModifedGroupNameOrId1++ModifedGroupNameOrId2++ModifedGroupNameOrId3...                                                                                                                                           | Add the new groups to the resource in Twingate<br/> No groups are removed from the Twingate Resource                         | None                                                   |


## Unsupported Actions
It is highly recommended to not perform any of the unsupported actions as they might cause unexpected behaviours later. 

| Unsupported Actions       | Immediate Behaviour                                                                                                                                                             |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ADD** tg_resource_id    | None                                                                                                                                                                            |
| **REMOVE** tg_resource    | None                                                                                                                                                                            |
| **REMOVE** tg_groups      | None                                                                                                                                                                            |
| **MODIFY** tg_resource    | New resource created with info in tg_resource tag<br/> New tg_resource_id tag value is assigned <br/> The Twingate resource base on previous tg_resource tag is **not** removed |
| **MODIFY** tg_resource_id | None                                                                                                                                                                            |



## Resource Name and Address Auto Filling
ResourceName and ResourceAddress are auto-filled if they are not provided as part of the ```tg_resource``` tag. (i.e. ```RemoteNetworkNameOrId++ResourceName``` or ```RemoteNetworkNameOrId```)

| Resource Type | Auto Fill Method                                                                                                                               | 
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| EC2 Instance  | ```ResourceAddress``` = Instance Private IPv4 <br/> ```ResourceName``` = Instance Name (Instance Private IPv4 If Instance Name does not exist) |
| ECS Task      | ```ResourceAddress``` = Task Private IPv4 <br/> ```ResourceName``` = Task Group - Task Definition - Task Private IPv4                          |
| RDS Instance  | ```ResourceAddress``` = Instance Endpoint <br/> ```ResourceName``` = DB Name (DB Instance Identifier if DB Name does not exist)                |


##  Supported AWS Resources

| AWS Resource           | Supported    | Auto Filling Resource Name Or Address |
|------------------------|--------------|---------------------------------------|
| EC2 Instance           | Yes          | Yes (In Progress)                     | 
| ECS Cluster            | Yes          | No                                    |
| ECS Service            | Yes          | No                                    |
| ECS Task               | Yes          | Yes (In Progress)                     |
| ECS Container Instance | Yes          | No                                    |
| ECS Instance           | No           | No                                    |
| RDS Cluster            | No           | No                                    |
| RDS Instance           | Yes          | Yes (In Progress)                     |


## CloudFormation.yaml Summary
TwingateRole is created with the following policies, this role is used for the Lambda execution:
- arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
- arn:aws:iam::aws:policy/ResourceGroupsandTagEditorFullAccess
- arn:aws:iam::aws:policy/AWSLambdaExecute
- arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
- "ec2:DeleteTags"
- "ec2:CreateTags"
- "ec2:Describe*"
- "ecs:TagResource"
- "ecs:UntagResource"
- "ecs:Describe*"
- "rds:AddTagsToResource"
- "rds:RemoveTagsFromResource"
- "rds:Describe*"

Noticeable Lambda Configuration:

| Configuration | Value      |
|---------------|------------|
| RAM           | 256MB      |
| Retry Limit   | 0          |
| Architectures | x86_64     |
| Runtime       | nodejs14.x |
| Timeout       | 60         |

