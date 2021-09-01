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
1. [Test Resiliency Using EC2 Failure Injection](05_ec2_failure.md)
1. [Test Resiliency Using RDS Failure Injection](06_rds_failure.md)
1. [Test Resiliency Using Availability Zone (AZ) Failure Injection](07_network_failure.md)
1. [Test Resiliency Using Failure Injection - Optional steps (S3)](08_s3_failure.md)
1. [Clean up](09_cleanup.md)


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

Using the following commands, deploy the CloudFormation template in this repository.  The template creates an autoscaling group of Windows EC2 instances with User Data, an application load balancer in front of the Windows servers, and an RDS database pre-populated with a schema.

```bash
git clone https://github.com/victoryuchenna/AWS-EC2-Chaos-Engineering.git
cd ~/environment/AWS-EC2-Chaos-Engineering
aws cloudformation deploy --template-file ha-application.yaml --stack-name ha-windows --capabilities CAPABILITY_IAM
```

**Note: ** The CloudFormation template will take about 20 minutes to deploy.  

When the CloudFormation template has been deployed you can visit the newly created website.  Obtain the URL for the new website using the following command and paste it into your web browser:

```bash
aws cloudformation describe-stacks --stack-name ha-windows --query 'Stacks[].Outputs[?OutputKey==`ApplicationURL`].OutputValue' --output text 
```

Create an S3 bucket and copy an image to it.  Note the URL of the S3 image.

CloudFormation template will also deploy a Locust.io load generator, placing the URL for the ALB and Locust load generator into the Cfn outputs.  The URL for the load generator can be obtained using the following command:

```bash
aws cloudformation describe-stacks --stack-name ha-windows --query 'Stacks[].Outputs[?OutputKey==`LoadGenURL`].OutputValue' --output text 
```

## 4. Preparation for Failure

Identify potential failures:
- loss of an EC2 instance
- overloading an EC2 CPU
- failover of the RDS database
- network disruption within an AZ
- loss of Amazon S3

Establish a steady state
- Start the load generator running at 5 requests per second and observe average response times and error rates.

## Workshop Summary

## FAQ

**1. During CloudFormation deployment the command returns with the following:**

```
Failed to create/update the stack. Run the following command
to fetch the list of events leading up to the failure
aws cloudformation describe-stack-events --stack-name ha-windows
```

This is ok, this response can also occur if the command times out while waiting for the CloudFormation template to complete its deployment.  To get the current status of the stack's deployment you can visit the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home) or use the following command:

```bash
aws cloudformation describe-stacks --stack-name ha-windows --query 'Stacks[0].StackStatus'
```

**2. After deploying the CloudFormation template, when accessing the web application URL, the system reponds with a `504: Bad Gateway` message.**

The Windows instances will take a few minutes to establish a connection with the MySQL database.  If the 504 error message persists for more than 5 minutes after the CloudFormation template has completed its deployment then something has gone wrong.

---

Now that you have deployed an application and identified some potential failures, conduct chaos experiments to test how the system responds to the failures.

To get started [cause some disruptions to EC2...](05_ec2_failure.md)
