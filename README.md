# Twingate Tag CloudWatch

Provides the ability to automatically create Twingate resources and adding group permission to these resources by monitoring the tagging of the AWS resources.


## Download The Latest Release
Download the latest ```Cloudformation.yaml``` and ```TgAwsTagWatchLmabda.zip``` at [Github Release](https://github.com/Twingate-Labs/tg-aws-tag-sync/releases/latest).

## Upload Lambda Function To AWS S3 Bucket
- Using an existing AWS S3 bucket or create a new one.
- Upload ```TgAwsTagWatchLmabda.zip``` To the S3 Bucket

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

| Tag         | Input Format                                       | Twingate Action                                   | AWS Action                                    |
|-------------|----------------------------------------------------|---------------------------------------------------|-----------------------------------------------|
| tg_resource | RemoteNetworkNameOrId,ResourceName,ResourceAddress | Create the resource in the Twingate               | adding tg_resource_id to the AWS resource tag |
| tg_groups   | GroupNameOrId1,GroupNameOrId2...                   | Add the defined groups into the Twingate resource | None                                          |

## Remove the Corresponding Twingate Resource
Remove the AWS tag 'tg_resource_id' From the AWS Instance.