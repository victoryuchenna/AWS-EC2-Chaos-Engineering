# Chaos Engineering for EC2-based Applications

## 7. Test Network Disruption

**AZ failure injection**

This failure injection will simulate a critical problem with one of the three AWS Availability Zones (AZs) used by your service. AWS Availability Zones are powerful tools for helping build highly available applications. If an application is partitioned across AZs, companies are better isolated and protected from issues such as lightning strikes, tornadoes, earthquakes and more.

1. Go to the RDS Dashboard in the AWS Console at http://console.aws.amazon.com/rds and note which Availability Zone the AWS RDS primary DB instance is in.
    * <b>Note</b>: If you previously ran the <b>RDS Failure Injection test</b>, you must wait until the console shows the AZs for the <i>primary</i> and <i>standby</i> instances as swapped, before running this test
    * A good way to run the AZ failure injection is first in an AZ other than this - we’ll call this <b>Scenario 1</b>
    * Then try it again in the same AZ as the AWS RDS primary DB instance - we’ll call this <b>Scenario 2</b>
    * Taking down two out of the three AZs this way is an unlikely use case, however it will show how AWS systems work to maintain service integrity despite extreme circumstances.
    * And executing this way illustrates the impact and response under the two different scenarios.

2. To simulate failure of an AZ, select one of the Availability Zones used by your service (`us-east-2a`, `us-east-2b`, or `us-east-2c`) as `<az>`

    * For <b>scenario 1</b> select an AZ that is neither <i>primary</i> nor <i>secondary</i> for your RDS DB instance. Given the following RDS console you would choose `us-east-2c`
    * For <b>scenario 2</b> select the AZ that is <i>primary</i> for your RDS DB instance. Given the following RDS console you would choose `us-east-2b`
    
    ![DB Configuration Short](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/DBConfigurationShort.png)

3. use your VPC ID as `<vpc-id>`

4. run this command `..\fail_az.ps1 <az> <vpc-id>`

5. The specific output will vary based on the command used.
    * Note whether an RDS failover was initiated. This would be the case if you selected the AZ containing the AWS RDS <i>primary</i> DB instance

**System response to AZ failure**

Watch how the service responds. Note how AWS systems help maintain service availability. Test if there is any non-availability, and if so then how long.

**System availability**

Refresh the service website several times
* <b>Scenario 1</b>: If you selected an AZ not containing the AWS RDS <i>primary</i> DB instance then you should see uninterrupted availability
* <b>Scenario 2</b>: If you selected the AZ containing the AWS RDS <i>primary</i> DB instance, then an availability loss similar to what you saw with RDS fault injection testing will occur.

**Scenario 1 - Load balancer and web server tiers**

This scenario is similar to the EC2 failure injection test because there is only one EC2 server per AZ in our architecture. Look at the same screens you as for that test:
* <a href="http://console.aws.amazon.com/ec2/v2/home?region=us-east-2#Instances:">EC2 Instances</a>
* Load Balancer <a href="http://console.aws.amazon.com/ec2/v2/home?region=us-east-2#TargetGroups:">Target group</a>
* <a href="http://console.aws.amazon.com/ec2/autoscaling/home?region=us-east-2#AutoScalingGroups:">Auto Scaling Groups</a>

One difference from the EC2 failure test that you will observe is that auto scaling will bring up the replacement EC2 instance in an AZ that already has an EC2 instance as it attempts to balance the requested three EC2 instances across the remaining AZs.

**Scenario 2 - Load balancer, web server, and data tiers**

This scenario is similar to a combination of the RDS failure injection along with EC2 failure injection. In addition to the EC2 related screens look at the <a href="http://console.aws.amazon.com/rds">Amazon RDS console</a>, navigate to your DB screen and observe the following tabs:
* Configuration
* Monitoring
* Logs & Events

**AZ failure injection - conclusion**

This similarity between <b>scenario 1</b> and the EC2 failure test, and between <b>scenario 2</b> and the RDS failure test is illustrative of how an AZ failure impacts your system. The resources in that AZ will have no or limited availability. With the strong partitioning and isolation between Availability Zones however, resources in the other AZs continue to provide your service with needed functionality. <b>Scenario 1</b> results in loss of the load balancer and web server capabilities in one AZ, while Scenario 2 adds to that the additional loss of the data tier. By ensuring that every tier of your system is in multiple AZs, you create a partitioned architecture resilient to failure.

**AZ failure recovery**

This step is optional. To simulate the AZ returning to health do the following:

1. Go to the <a href="http://console.aws.amazon.com/ec2/autoscaling/home?region=us-east-2#AutoScalingGroups:">Auto Scaling Group console</a>
2. Select the <b>WebServersforResiliencyTesting</b> auto scaling group
3. Actions » Edit
4. In the <b>Subnet</b> field add any <b>ResiliencyVPC-PrivateSubnet</b>s that are missing (there should be three total) and <b>Save</b>
5. Go to the <a href="https://us-east-2.console.aws.amazon.com/vpc/home?region=us-east-2#acls:">Network ACL console</a>
6. Look at the NACL entries for the VPC called <b>ResiliencyVPC</b>
7. For any of these NACLs that are not Default do the following
    1. Select the NACL
    2. <b>Actions » Edit subnet associations</b>
    3. Uncheck all boxes and click <b>Edit</b>
    4. <b>Actions » Delete network ACL</b>

*  Note how the auto scaling redistributes the EC2 serves across the availability zones
