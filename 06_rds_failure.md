# Chaos Engineering for EC2-based Applications

## 6. Test RDS Failover
This failure injection will simulate a fail over of the system's managed database.

1. Before you initiate the failure simulation, refresh the service website several times. Every time the image is loaded, the website writes a record to the Amazon RDS database

2. Click on <b>click here to go to other page</b> and it will show the latest ten entries in the Amazon RDS DB

    1. The DB table shows “hits” on our <i>image page</i>
    2. Website URL access requests are shown here for traffic against the <i>image page</i>. These include IPs of browser traffic as well as IPs of load balancer health checks
    3. For each region the AWS Elastic Load Balancer makes these health checks, so you will see three IP addresses from these
    4. Click on <b>click here to go to other page</b> again to return to the <i>image page</i>
3. Go to the RDS Dashboard in the AWS Console at http://console.aws.amazon.com/rds

4.  From the RDS dashboard

    -  Click on “DB Instances (n/40)”
    - Click on the DB identifier for your database (if you have more than one database, refer to the <b>VPC ID</b> to find the one for this workshop)
    - Select the <b>Configuration</b> tab

5. Look at the configured values. Note the following:
    - Value of the <b>Info</b> field is <b>Available</b>
    - RDS DB is configured to be <b>Multi-AZ</b>. The primary DB instance is in AZ <b>us-east-2a</b> and the standby DB instance is in AZ <b>us-east-2b</b>

![DB Initial Configuration](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/DBInitialConfiguration.png)

6. To failover of the RDS instance, use the VPC ID as the command line argument replacing `<vpc-id>` in one (and only one) of the scripts/programs below.

    ```bash 
    .\failover_rds.ps1 <vpc-id>
     ```

<!-- NEED TO TEST THIS-->
7. The specific output will vary based on the command used, but will include some indication that the your Amazon RDS Database is being failedover: `Failing over mdk29lg78789zt` 
<!-- NEED TO TEST THIS-->

**System response to RDS instance failure**

Watch how the service responds. Note how AWS systems help maintain service availability. Test if there is any non-availability, and if so then how long.

**System availability**

1. The website is not available. Some errors you might see reported:
    - <b>No Response / Timeout</b>: Request was successfully sent to EC2 server, but server no longer has connection to an active database.
    - <b>504 Gateway Time-out</b>: Amazon Elastic Load Balancer did not get a response from the server. This can happen when it has removed the servers that are unable to respond and added new ones, but the new ones have not yet finished initialization, and there are no healthy hosts to receive the request.
    - <b>502 Bad Gateway</b>: The Amazon Elastic Load Balancer got a bad request from the server.
    - An error you will not see is <b>This site can’t be reached</b>. This is because the Elastic Load Balancer has a node in each of the three Availability Zones and is always available to serve requests.

2. Continue on to the next steps, periodically returning to attempt to refresh the website.

**Failover to standby**

1. On the database console <b>Configuration</b> tab
    1. Refresh and note the values of the <b>Info</b> field. It will ultimately return to <b>Available</b> when the failover is complete.
    2. Note the AZs for the primary and standby instances. They have swapped as the standby has no taken over primary responsibility, and the former primary has been restarted. (After RDS failover it can take several minutes for the console to update as shown below. The failover has however completed)

        ![DB PostFail Configuration](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/DBPostFailConfiguration.png)

    3. From the AWS RDS console, click on the <b>Logs & events</b> tab and scroll down to <b>Recent events</b>. You should see entries like those below. In this case failover took less than a minute.

    ```  
    Mon, 14 Oct 2019 19:53:37 GMT - Multi-AZ instance failover started.
    Mon, 14 Oct 2019 19:53:45 GMT - DB instance restarted
    Mon, 14 Oct 2019 19:54:21 GMT - Multi-AZ instance failover completed
    ```

**EC2 server replacement**

1. From the AWS RDS console, click on the <b>Monitoring</b> tab and look at <b>DB connections</b>
    - As the failover happens the existing three servers all cannot connect to the DB

    - AWS Auto Scaling detects this (any server not returning an http 200 status is deemed unhealthy), and replaces the three EC2 instances with new ones that establish new connections to the new RDS primary instance

    - The graph shows an unavailability period of about four minutes until at least one DB connection is re-established

        ![RDS DB Connection](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/RDSDbConnections.png)

2. [optional] Go to the [Auto scaling group](https://us-east-2.console.aws.amazon.com/ec2autoscaling/home?region=us-east-2#/details) and AWS Elastic Load Balancer [Target group](http://console.aws.amazon.com/ec2/v2/home?region=us-east-2#TargetGroups:) consoles to see how EC2 instance and traffic routing was handled

### 6.2 Database Failover Conclusion

- AWS RDS Database failover took less than a minute
- Time for AWS Auto Scaling to detect that the instances were unhealthy and to start up new ones took four minutes. This resulted in a four minute non-availability event.

### 6.3 Mitigating Database Failover

In this section you reduce the unavailability time from four minutes to <i>under one minute.</i>

> Note: This part of the RDS failure simulation is optional. If you are running this lab as part of a live workshop, then you may want to skip this and come back to it later.

You observed before that failover of the RDS instance itself takes under one minute. However the servers you are running are configured such that they cannot recognize that the IP address for the RDS instance DNS name has changed from the primary to the standby. Availability is only regained once the servers fail to reach the primary, are marked unhealthy, and then are replaced. This accounts for the four minute delay. <b>In this part of the lab you will update the server code to be more resilient to RDS failover. The new code can recognize underlying changes in IP address for the RDS instance DNS name</b>

Use <i>either</i> the <b>Express Steps or Detailed Steps </b>below:

Express Steps

1. Go to the AWS CloudFormation console at https://console.aws.amazon.com/cloudformation
2. For the <b>WebServersForResiliencyTesting</b> Cloudformation stack
    1. Redeploy the stack and <b>Use current template</b>

    2. Change the <b>BootObject</b> parameter to `server_with_reconnect.py`

Detailed Steps
<details>
<summary>Click here for detailed steps for updating the Cloudformation stack:</summary>
<br>

1. Go to the AWS CloudFormation console at https://console.aws.amazon.com/cloudformation

2. Click on <b>WebServersForResiliencyTesting</b> Cloudformation stack
3. Click the <b>Update</b> button
4. Select <b>Use current template</b> then click <b>Next</b>
5. On the <b>Parameters</b> page, find the <b>BootObject</b> parameter and replace the value there with `server_with_reconnect.py`
6. Click <b>Next</b>
7. Click <b>Next</b>
8. Scroll to the bottom and under <b>Change set preview</b> note that you are changing the <b>WebServerAutoscalingGroup</b> and <b>WebServerLaunchConfiguration</b>. This CloudFormation deployment will modify the launch configuration to use the improved server code.
9. Check <b>I acknowledge that AWS CloudFormation might create IAM resources</b>.
10. Click <b>Update stack</b>
11. Go the <b>Events</b> tab for the <b>WebServersForResiliencyTesting</b> Cloudformation stack and observe the progress. When the status is <b>UPDATE_COMPLETE_CLEANUP_IN_PROGRESS</b> you may continue.
</details>

RDS failure injections - observations

Now repeat the RDS failure injection steps on this page, starting with [RDS failure injection](#TestRDSFailover).

* You will observe that the unavailability time is now under one minute
* What else is different compared to the previous time the RDS instance failed over?

<hr>

**Resources**

<i><b>Learn more</b>: After the lab see [High Availability (Multi-AZ) for Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html) for more details on high availability and failover support for DB instances using Multi-AZ deployments.</i>

<b>High Availability (Multi-AZ) for Amazon RDS</b>

The primary DB instance switches over automatically to the standby replica if any of the following conditions occur:

* An Availability Zone outage
* The primary DB instance fails
* The DB instance’s server type is changed
* The operating system of the DB instance is undergoing software patching
 * A manual failover of the DB instance was initiated using Reboot with failover

---

In the next lab you will [disrupt the network between components of the system...](07_network_failure.md)