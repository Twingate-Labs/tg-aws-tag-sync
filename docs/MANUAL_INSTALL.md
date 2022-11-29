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
  