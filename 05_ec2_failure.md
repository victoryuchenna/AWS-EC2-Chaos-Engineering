# Chaos Engineering for EC2-based Applications

## 5. Test EC2 Failure

This failure injection will simulate a critical problem with one of the three web servers used by your service.

Applications are at risk for a number of hazards at any given time.  Hazards such as an overloaded CPU, memory exhaustion, a filesystem with no remaining space, or too many open file descriptors - to name a few.  It is impossible to predict and simulate all possible permutations of environmental conditions in which your application operates. In the following lab you will:

* Stress test the CPU of one of the EC2 instances running your application

* Delete one of the instances hosting your application to observe the effect it has on the steady state

### 5.1 CPU Overload Experiment

A CPU stress test is the act of deliberately running your system at maximum capacity for a sustained period of time in order to evaluate the stability of its performance.

1. To run this test you will first connect to one of the EC2 instances running your application through session manager

2. Next, Execute the script below. Start by changing the duration to 300 seconds and then run the script again for 600 seconds

```
 $NumberOfLogicalProcessors = Get-WmiObject win32_processor | Select-Object -ExpandProperty NumberOfLogicalProcessors
        ForEach ($core in 1..$NumberOfLogicalProcessors){
          Start-Job -Name "ChaosCpu$core" -ScriptBlock {
            $result = 1;
            ForEach ($loopnumber in 1..2147483647){
              $result=1;
              ForEach ($loopnumber1 in 1..2147483647){
                $result=1;
                ForEach($number in 1..2147483647){
                  $result = $result * $number
                } 
              }
            }
          } | Out-Null
          Write-Host "Started Job ChaosCpu$core"
        }
        Write-Host "About to sleep for {{duration}} seconds"
        $totalduration = {{duration}}
        Start-Sleep -s ($totalduration/2)
        Get-WmiObject Win32_Processor | Select LoadPercentage | Format-List
        Start-Sleep -s ($totalduration/2)
        Get-WmiObject Win32_Processor | Select LoadPercentage | Format-List
        
        Write-Host "About to stop jobs"
        $cpuJobs = Get-Job -Name "ChaosCpu*"
        ForEach ($job in $cpuJobs) {
          Stop-Job -Name $job.Name | Out-Null
          Write-Host "Stopped $($job.Name)"
          Remove-Job -Name $job.Name | Out-Null
          Write-Host "Removed $($job.Name)"
        }
```

3. To monitor the CPU stress, in another tab select on the EC2 instance running the script and click on monitor and observe as the CPU usage spikes up

4. On another tab open Locust.io and keep on aye on the failures and RPS
5. Open another tab, on the sidebar, navigate to target groups under load balancing. Select the right target group and click on monitoring. Monitor how the graphs change as you run the script.

![Monitoring](targetgroupmonitoring.png)


<b>Points to ponder:</b>
* What did you notice during the test?
* Why was the website not affected?
* Did you notice any changes when you increase the duration from 300 seconds to 600 seconds?
* If you ran the script for longer what do you think would happen to the instance?



### 5.2 EC2 Instance Termination

Whether its a full disk, overloaded CPU, or a crashed JVM - there are many things that could result in an application on an EC2 instance becoming unavailable.  It can be difficult to predict them all so its best to just assume that something can / will take down an application and simulate this by terminating an EC2 instance that is hosting the application.

1. To begin create a simple shell script to terminate one of the EC2 instances.

    ```bash
    cat >fail_instance.sh <<'EOF'
    # One argument required: VPC of deployed service
    if [ $# -ne 1 ]; then
    echo "Usage: $0 <vpc-id>"
    exit 1
    fi

    #Find the first running instance in the reservation list that has an instance and return it's instance ID.
    #Note: This is making a lot of assumptions. A lot more error checking could be done
    instance_id=`aws ec2 describe-instances --filters Name=instance-state-name,Values=running Name=vpc-id,Values=$1 --query 'Reservations[0].Instances[0].InstanceId' --output text`
    echo "Terminating $instance_id"

    # Terminate that instance
    aws ec2 terminate-instances --instance-ids $instance_id
    EOF
    chmod 0755 ./fail_instance.sh
    ```

1. Next execute the script, passing it the ID of the VPC holding the application.

    ```bash
    ./fail_instance.sh vpc-1234567890
    ```

    The script should output information similar to the following:
    ```bash
    Terminating i-0710123abc631eab3
    {
        "TerminatingInstances": [
            {
                "CurrentState": {
                    "Code": 32,
                    "Name": "shutting-down"
                },
                "InstanceId": "i-0710123abc631eab3",
                "PreviousState": {
                    "Code": 16,
                    "Name": "running"
                }
            }
        ]
    }
    ```

1. Go to the [EC2 Instances console](http://console.aws.amazon.com/ec2/v2/home?region=us-east-2#Instances:) and confirm that the specified instance is shutting down or terminating.  

1. If you click refresh on the EC2 console you should notice that the auto scaling group launches a new instance to replace the failed instance.

1. Observe the effect on the steady state of the application in the Locust.IO dashboard.  

During the course of the test the error rate for the application should not have exceeded normal levels (around 7%).  

**System Availability**

By monitoring the Locust.IO dashboard you should note that the availability for the application is maintained by the 2 remaining instances in the autoscaling group.  

**Load Balancing**
Load balancing ensures service requests are not routed to unhealthy resources, such as the failed EC2 instance.

1. Go to the [Target Groups console](http://console.aws.amazon.com/ec2/v2/home?region=us-east-2#TargetGroups:) and select the target group for your application.

1. Click on the Targets tab and note:

    - Status of the instances in the group. The load balancer will only send traffic to healthy instances.
    - When the auto scaling launches a new instance, it is automatically added to the load balancer target group.
    - In the screen cap below the unhealthy instance is the newly added one. The load balancer will not send traffic to it until it is completed initializing. It will ultimately transition to healthy and then start receiving traffic.
    - Note the new instance was started in the same Availability Zone as the failed one. Amazon EC2 Auto Scaling automatically maintains balance across all of the Availability Zones that you specify.

    ![Target Group Detail](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/TargetGroups.png)

1. From the same console, now click on the **Monitoring** tab and view metrics such as **Unhealthy** hosts and **Healthy** hosts

![Healthy Hosts](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/TargetGroupsMonitoring.png)

**Auto Scaling**

Auto scaling ensures we have the capacity necessary to meet customer demand. The auto scaling for this service is a simple configuration that ensures at least three EC2 instances are running. More complex configurations in response to CPU or network load are also possible using AWS.

1. Go to the [Auto Scaling Groups console](http://console.aws.amazon.com/ec2/autoscaling/home?region=us-east-2#AutoScalingGroups:)

1. Click on the **Activity History** tab and observe:

    - The screen cap below shows that all three instances were successfully started at the same time.

    - At 19:29 the instance targeted by the script was put in draining state and a new instance ending in …62640 was started, but was still initializing. The new instance will ultimately transition to Successful status

    ![Auto Scaling Detail](https://www.wellarchitectedlabs.com/Reliability/300_Testing_for_Resiliency_of_EC2_RDS_and_S3/Images/AutoScalingGroup.png)

Draining allows existing, in-flight requests made to an instance to complete, but it will not send any new requests to the instance. To learn more after the lab see [this blog post](https://aws.amazon.com/blogs/aws/elb-connection-draining-remove-instances-from-service-with-care/) for more information on draining.

To find out more about auto scaling groups see [EC2 Auto Scaling Groups documentation](https://docs.aws.amazon.com/autoscaling/ec2/userguide/AutoScalingGroup.html).  The documentation covers how auto scaling groups are setup and how they distribute instances.  Also see [Dynamic Scaling for Amazon EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scale-based-on-demand.html) for more details on setting up auto scaling that responds to demand

### 5.3 Conclusion

Deploying multiple servers and Elastic Load Balancing enables a service suffer the loss of a server with no availability disruptions as user traffic is automatically routed to the healthy servers. Amazon Auto Scaling ensures unhealthy hosts are removed and replaced with healthy ones to maintain high availability.

---

Now continue to the next lab to see how to test how the system responds to a [database failover...](06_rds_failure.md)