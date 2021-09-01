# Chaos Engineering for EC2-based Applications

## 9. Clean up

<b>If you are attending an in-person workshop and were provided with an AWS account by the instructor:</b>

* There is no need to tear down the lab. Feel free to continue exploring. Log out of your AWS account when done.

<b>If you are using your own AWS account:</b>

* You may leave these resources deployed for as long as you want. When you are ready to delete these resources, see the following instructions

<b>Remove manually provisioned resources</b>
Some resources were created by the failure simulation scripts. You need to remove these first

1. Go to the <a href="https://us-east-2.console.aws.amazon.com/vpc/home?region=us-east-2#acls:">Network ACL console</a>
2. Look at the NACL entries for the VPC called <b>ResiliencyVPC</b>
3. For any of these NACLs that are <i>not Default</i> do the following
    1. Select the NACL
    2. <b>Actions » Edit subnet associations</b>
    3. Uncheck all boxes and click <b>Edit</b>
    4. <b>Actions » Delete network ACL</b>


**Remove AWS CloudFormation provisioned resources**

As part of lab setup you have deployed several AWS CloudFormation stacks. These directions will show you:

* How to delete an AWS CloudFormation stack
* In what specific order the stacks must be deleted

**How to delete an AWS CloudFormation stack**

1. Go to the AWS CloudFormation console: https://console.aws.amazon.com/cloudformation
2. Select the CloudFormation stack to delete and click <b>Delete</b>

    ![Deleting Web Servers](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/DeletingWebServers.png)

3. In the confirmation dialog, click <b>Delete stack</b>
4. The Status changes to <b>DELETE_IN_PROGRESS</b>
5. Click the refresh button to update and status will ultimately progress to <b>DELETE_COMPLETE</b>
6. When complete, the stack will no longer be displayed. To see deleted stacks use the drop down next to the Filter text box.
    ![Show Deleted Stacks](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/ShowDeletedStacks.png)

7. To see progress during stack deletion
    * Click the stack name
    * Select the Events column
    * Refresh to see new events

**Delete workshop CloudFormation stacks**
* Since AWS resources deployed by AWS CloudFormation stacks may have dependencies on the stacks that were created before, then deletion must occur in the opposite order they were created
* Stacks with the same ordinal can be deleted at the same time. All stacks for a given ordinal must be DELETE_COMPLETE before moving on to the next ordinal

delete your stacks in the following order
<table>
  <tr>
    <th>Order</th>
    <th>CloudFormation stack</th>
  </tr>
  <tr>
    <td>1</td>
    <td>WebServersforResiliencyTesting</td>
  </tr>
  <tr>
    <td>2</td>
    <td>MySQLforResiliencyTesting</td>
  </tr>
  <tr>
  <td>3</td>
  <td>ResiliencyVPC</td>
  </tr>
  <tr>
  <td>4</td>
  <td>DeployResiliencyWorkshop</td>
  </tr>
</table>

**Delete remaining resources**

<b>Delete Lambda execution role used to create custom resource</b>

This role was purposely not deleted by the CloudFormation stack, because CloudFormation needs it to delete the custom resource it was used to create. <i>Choose ONE</i>: AWS CLI <b>or</b> AWS Console.

* Do this step only after ALL CloudFormation stacks are <b>DELETE_COMPLETE</b>

Using AWS CLI:

```
aws iam delete-role-policy --role-name LambdaCustomResourceRole-SecureSsmForRds --policy-name LambdaCustomResourcePolicy

aws iam delete-role --role-name LambdaCustomResourceRole-SecureSsmForRds
```

Using AWS Console:

1. Go to the IAM Roles Console: https://console.aws.amazon.com/iam/home#/roles
2. Search for `SecureSsmForRds`
3. Check the box next to `LambdaCustomResourceRole-SecureSsmForRds`
4. Click <b>Delete role</b> button
5. Click <b>Yes, delete</b> button



<hr>

**References & useful resources**

* EC2 <a href="https://docs.aws.amazon.com/autoscaling/ec2/userguide/AutoScalingGroup.html">Auto Scaling Groups</a>
* <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html">What Is an Application Load Balancer?</a>
* <a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html">High Availability(Multi-AZ) for Amazon RDS
    Amazon RDS Under the Hood: Multi-AZ
    Regions and Availability Zones
    Injecting Chaos to Amazon EC2 using AWS System Manager
    Build a serverless multi-region, active-active backend solution in an hour