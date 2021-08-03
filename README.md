# Chaos Engineering for EC2-based Applications

> This lab is based upon the [300-level Well Architected Labs for Reliability](https://www.wellarchitectedlabs.com/reliability/300_labs/300_testing_for_resiliency_of_ec2_rds_and_s3/) by Seth Eliot, Adrian Hornsby, and Rodney Lester.

## Introduction
The purpose if this workshop is to teach you the fundamentals of using tests to ensure your application is resilient to failure by injecting failure modes into your application. As the complexity of modern IT systems is increasing, the ability to quantify and predict the behavior of the system as a whole is approaching 0.  To have confidence in the reliability of an application, to understand its behavior in the face of failure, you must test the application under production-like conditions by injecting failures that may disrupt the applications ability to perform.

It is not sufficient to only design for failure, you must also test to ensure that you understand how the failure will cause your systems to behave. The act of conducting these tests will also give you the ability to create playbooks for how to investigate failures. You will also be able to create playbooks for identifying root causes. If you conduct these tests regularly, then you will identify changes to your application that are not resilient to failure and also create the skills to react to unexpected failures in a calm and predictable manner.

In this lab, you will deploy a 3-tier resource, with an application load balancer, web application on Amazon Elastic Compute Cloud (EC2), and MySQL database using Amazon Relational Database Service (RDS). 

The skills you will learn will help you build resilient workloads in alignment with the AWS Well-Architected Framework

During this workshop you will create chaos experiments to test the reliability of a Microsoft Windows-based EC2 3-tier web application.

## Goals:
- Reduce fear of implementing resiliency testing by providing examples in common development and scripting languages
- Resilience testing of EC2 instances
- Resilience testing of RDS Multi-AZ instances
- Resilience testing using Availability Zones failures
- Resilience testing of S3 objects
- Learn how to implement resiliency using those tests
- Learn how to think about what a failure will cause within your infrastructure
- Learn how common AWS services can reduce mean time to recovery (MTTR)

## Pre-requisites:
This lab will require you to have access to an AWS account and familiarity with the Microsoft Windows and Linux command line.

## Costs
This lab will create resources that will cost approximately $6.50 per day.  Please follow the directions for clean up to avoid unwanted costs after the workshop is done.

## Table of content
1. Introduction to Chaos Engineering
1. Configure Execution Environment
1. Deploy the Infrastructure and Application
1. Preparation for Failure Injection
1. Test Resiliency Using EC2 Failure Injection
1. Test Resiliency Using RDS Failure Injection
1. Test Resiliency Using Availability Zone (AZ) Failure Injection
1. Test Resiliency Using Failure Injection - Optional steps
1. Clean up


## 1. Chaos Engineering:
Chaos Engineering is the discipline of experimenting on a system in order to build confidence in the system’s capability to withstand turbulent conditions in production.
Chaos Engineering lets you compare what you think will happen to your system when it encounters failure verses what actually happens to you systems. you can then use your finding to build a more resilient system for your workload.

It is not sufficient to only design for failure, you must also test to ensure that you understand how the failure will cause your systems to behave. The act of conducting these tests will also give you the ability to create playbooks on how to investigate failures. You will also be able to create playbooks for identifying root causes. If you conduct these tests regularly, then you will identify changes to your application that are not resilient to failure and also create the skills to react to unexpected failures in a calm and predictable manner.

## 2. Execution Environment

For today's workshop you will use simple scripts to inject faults into the application environment.  Specifically you will use an AWS Cloud9 IDE environment which is based on Amazon Linux 2.  You will run Bash shell scripts for this environment however you could just as easily use Python, Powershell, or other tools that can levarege the AWS CLI or the AWS SDKs.

1. Connect to Cloud9 IDE
1. Download / install any tools such as JQ, AWS CLI, or others

## 3. Infrastructure Deployment

You will create a multi-tier architecture using AWS and run a simple service on it. The service is a web server running on Amazon EC2 fronted by an application load balancer, with a data store on Amazon Relational Database Service (RDS).

![Multi-tier applcation](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/ThreeTierArchitecture.png)

Using the AWS CLI deploy a CloudFormation template to create the application architecture.

Run a Cloudformation template that creates an ASG, Windows EC2 with User Data, ALB, and an RDS database pre-populated with a schema.

Create an S3 bucket and copy an image to it.  Note the URL of the S3 image.

CloudFormation template will also deploy a Locust.io load generator, placing the URL for the ALB and Locust load generator into the Cfn outputs.

## 4. Preparation for Failure

Identify potential failures:
- loss of an EC2 instance
- failover of the RDS database
- network disruption within an AZ
- loss of Amazon S3

Establish a steady state
- Start the load generator running at 100 requests per second and observe average response times and error rates.


## 5. Test EC2 Failure

This failure injection will simulate a critical problem with one of the three web servers used by your service.

1. Execute fail_instance.sh to fail one of the three EC2 instances hosting your application.

1. Observe the effect on the steady state of the application.

**System Availability**

**Load Balancing**
Load balancing ensures service requests are not routed to unhealthy resources, such as the failed EC2 instance.

    Go to the Target Groups console
        If there is more than one target group, select the one with the Load Balancer named ResiliencyTestLoadBalancer

    Click on the Targets tab and observe:

        Status of the instances in the group. The load balancer will only send traffic to healthy instances.

        When the auto scaling launches a new instance, it is automatically added to the load balancer target group.

        In the screen cap below the unhealthy instance is the newly added one. The load balancer will not send traffic to it until it is completed initializing. It will ultimately transition to healthy and then start receiving traffic.

        Note the new instance was started in the same Availability Zone as the failed one. Amazon EC2 Auto Scaling automatically maintains balance across all of the Availability Zones that you specify.

![Target Group Detail](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/TargetGroups.png)

From the same console, now click on the Monitoring tab and view metrics such as Unhealthy hosts and Healthy hosts

![Healthy Hosts](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/TargetGroupsMonitoring.png)

**Auto Scaling**

Auto scaling ensures we have the capacity necessary to meet customer demand. The auto scaling for this service is a simple configuration that ensures at least three EC2 instances are running. More complex configurations in response to CPU or network load are also possible using AWS.

    Go to the Auto Scaling Groups console you already have open (or click here to open a new one )
        If there is more than one auto scaling group, select the one with the name that starts with WebServersforResiliencyTesting

    Click on the Activity History tab and observe:

        The screen cap below shows that all three instances were successfully started at 17:25

        At 19:29 the instance targeted by the script was put in draining state and a new instance ending in …62640 was started, but was still initializing. The new instance will ultimately transition to Successful status

![Auto Scaling Detail](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/AutoScalingGroup.png)

Draining allows existing, in-flight requests made to an instance to complete, but it will not send any new requests to the instance. Learn more: After the lab see this blog post for more information on draining.

Learn more: After the lab see Auto Scaling Groups to learn more how auto scaling groups are setup and how they distribute instances, and Dynamic Scaling for Amazon EC2 Auto Scaling for more details on setting up auto scaling that responds to demand

**EC2 failure injection - conclusion**

Deploying multiple servers and Elastic Load Balancing enables a service suffer the loss of a server with no availability disruptions as user traffic is automatically routed to the healthy servers. Amazon Auto Scaling ensures unhealthy hosts are removed and replaced with healthy ones to maintain high availability.

## 6. Test RDS Failover
This failure injection will simulate a critical failure of the Amazon RDS DB instance.

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
    - If running the <b>multi-region</b> deployment, select the DB instance with Role=<b>Master</b>
    - Select the <b>Configuration</b> tab

5. Look at the configured values. Note the following:
    - Value of the <b>Info</b> field is <b>Available</b>
    - RDS DB is configured to be <b>Multi-AZ</b>. The primary DB instance is in AZ <b>us-east-2a</b> and the standby DB instance is in AZ <b>us-east-2b</b>

![DB Initial Configuration](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/DBInitialConfiguration.png)

6. To failover of the RDS instance, use the VPC ID as the command line argument replacing `<vpc-id>` in one (and only one) of the scripts/programs below. (choose the language that you setup your environment for)
    <table>
    <tr>
    <th>Language</th>
    <th>Command</th>
    </tr>
    <tr>
    <td>Bash</td>
    <td>`./failover_rds.sh <vpc-id>`</td>
    </tr>
    <tr>
    <td>Python</td>
    <td>`python fail_rds.py<vpc-id>`</td>
    </tr>
    <tr>
    <td>Java</td>
    <td>`java -jar app-resiliency-1.0.jar RDS <vpc-id>`</td>
    </tr>
    <tr>
    <td>C#</td>
    <td>`.\AppResiliency RDS <vpc-id>`</td>
    </tr>
    <tr>
    <td>Powershell</td>
    <td>`.\failover_rds.ps1 <vpc-id>`</td>
    </tr>
    </table>

7. The specific output will vary based on the command used, but will include some indication that the your Amazon RDS Database is being failedover: `Failing over mdk29lg78789zt`
## 7. Test Network Disruption
## 8. Test S3 Failure
## 9. Clean up