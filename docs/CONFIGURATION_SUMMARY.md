## CloudFormation.yaml Summary
TwingateRole is created with the following policies, this role is used for the Lambda execution:
- arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
- arn:aws:iam::aws:policy/ResourceGroupsandTagEditorFullAccess
- arn:aws:iam::aws:policy/AWSLambdaExecute
- arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
- ec2:DeleteTags
- ec2:CreateTags
- ec2:Describe*
- ecs:TagResource
- ecs:UntagResource
- ecs:Describe*
- rds:AddTagsToResource
- rds:RemoveTagsFromResource
- rds:Describe*

Noticeable Lambda Configuration:

| Configuration | Value      |
|---------------|------------|
| RAM           | 256MB      |
| Retry Limit   | 0          |
| Architectures | x86_64     |
| Runtime       | nodejs18.x |
| Timeout       | 60         |