# Twingate Tag CloudWatch

Provides the ability to automatically create Twingate resources and adding group permission to these resources by monitoring the tag changes of the AWS resources.

# Installation Steps

### AWS Serverless Application Repository
1. Ensure you have the following pre-requisites:
   * The AWS user has the permission to create new IAM roles, Lambda functions and EventWatch rules
   * Twingate Network Address, e.g. example.twingate.com
   * Twingate API Key, can be generated in the Setting page within the Twingate Admin Console (Read, Write and Provision permission is required)
2. Click the ***Install on AWS*** button below
   * Select *Deploy*
   * Select AWS region in *AWS Admin Console*
   * Input the *TwingateNetworkAddress* and *TwingateApiKey*
   * Enable *"I acknowledge that this app creates custom IAM roles and resource policies."*
   * Select *Deploy*
   * Click *Deployments* tab -> *View stack events* button -> *Events tab*
   * Wait until The CloudFormation is created

[![Install on AWS](./button_install-on-aws.png)](https://serverlessrepo.aws.amazon.com/applications/eu-west-2/284996965266/tg-aws-tag-sync)

Note: the application can be deployed in multiple region be repeating the steps above.

### Manual Installation Steps
For manual installation steps, see [Manual Install Steps](./docs/MANUAL_INSTALL.md)

# How To Use
Tag an AWS resource with the following tags

| Supported Actions                | Input Format                                                                                                                                                                                                | Twingate Action                                                                                                                  | AWS Action                                                   |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **ADD** <br/>`tg_resource`       | `RemoteNetworkNameOrId++ResourceName++ResourceAddress` <br/> `RemoteNetworkNameOrId++ResourceName` (resource address auto-filled)<br/> `RemoteNetworkNameOrId` (resource name and address auto-filled)<br/> | Create the resource in the Twingate (the defined remote network need to exist in the Twingate)                                   | adding `tg_resource_id` to the AWS resource tag              |
| **ADD** <br/>`tg_groups`         | `GroupNameOrId1++GroupNameOrId2++GroupNameOrId3...`                                                                                                                                                         | Add the defined groups into the Twingate resource (`tg_resource` should exist on the AWS resource before adding `tg_groups` tag) | None                                                         |
| **REMOVE** <br/>`tg_resource_id` | None                                                                                                                                                                                                        | Remove the resource in the Twingate                                                                                              | Remove `tg_groups` and `tg_resource` from AWS `resource` tag |
| **MODIFY** <br/>`tg_groups`      | `ModifedGroupNameOrId1++ModifedGroupNameOrId2...`                                                                                                                                                           | Add the new groups to the resource in Twingate<br/> No groups are removed from the Twingate Resource                             | None                                                         |

### Resource Name and Address Auto Filling
ResourceName and ResourceAddress are auto-filled if they are not provided as part of the ```tg_resource``` tag. (i.e. ```RemoteNetworkNameOrId++ResourceName``` or ```RemoteNetworkNameOrId```)

| Resource Type | Auto Fill Method                                                                                                                               | 
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| EC2 Instance  | ```ResourceAddress``` = Instance Private IPv4 <br/> ```ResourceName``` = Instance Name (Instance Private IPv4 If Instance Name does not exist) |
| ECS Task      | ```ResourceAddress``` = Task Private IPv4 <br/> ```ResourceName``` = Task Group - Task Definition - Task Private IPv4                          |
| RDS Instance  | ```ResourceAddress``` = Instance Endpoint <br/> ```ResourceName``` = DB Name (DB Instance Identifier if DB Name does not exist)                |


### Unsupported Actions
It is highly recommended to **not** perform any of the unsupported actions as they might cause unexpected behaviours later. 

| Unsupported Actions       | Immediate Behaviour                                                                                                                                                                   |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ADD** `tg_resource_id`    | None                                                                                                                                                                                  |
| **REMOVE** `tg_resource`    | None                                                                                                                                                                                  |
| **REMOVE** `tg_groups`      | None                                                                                                                                                                                  |
| **MODIFY** `tg_resource`    | New resource created with info in `tg_resource` tag<br/> New `tg_resource_id` tag value is assigned <br/> The Twingate resource base on previous `tg_resource` tag is **not** removed |
| **MODIFY** `tg_resource_id` | EC2 and ECS: None<br/> RDS: The resource from Twingate is deleted                                                                                                                     |





#  Supported AWS Resources

| AWS Resource           | Supported    | Auto Filling Resource Name Or Address |
|------------------------|--------------|---------------------------------------|
| EC2 Instance           | Yes          | Yes                                   | 
| ECS Cluster            | Yes          | No                                    |
| ECS Service            | Yes          | No                                    |
| ECS Task               | Yes          | Yes                                   |
| ECS Container Instance | Yes          | No                                    |
| ECS Instance           | No           | No                                    |
| RDS Cluster            | No           | No                                    |
| RDS Instance           | Yes          | Yes                                   |

# Configuration Summary
See [Configuration Summary](./docs/CONFIGURATION_SUMMARY.md)


