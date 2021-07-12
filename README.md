# AWS-FIS-Workshop
## Introduction
The following workshop will walk you through the process of running fault injection experiments on AWS services using [AWS FIS](https://aws.amazon.com/fis/)
You will learn how to inject failure at the EC2 OS Level, then at the network and managed service level.

## Goals:

## Steps
1. Prerequities
2. Create a stop condition 
3. Create an experiment template
4. Start the experiment
5. Start the experiment
6. Clean up


## Prerequities:
* Launch two test EC2 instances in your account. After you launch your instances, take note of the IDs of both instances. 
* Ensure that you have created an IAM role that enables the AWS FIS service to perform actions on your behalf. For more information, see Step 2: Set up the IAM role for the AWS FIS service (https://docs.aws.amazon.com/fis/latest/userguide/getting-started-iam.html#getting-started-iam-service-role). 

## Create a stop condition 
Create a CloudWatch alarm for your stop condition.

For information about creating CloudWatch alarms, see Create a CloudWatch Alarm Based on a Static Threshold and Creating a CloudWatch Alarm Based on Anomaly Detection in the Amazon CloudWatch User Guide. 

## Create an experiment template 
Create the experiment template using the AWS FIS console. In the template, you specify two actions that will run sequentially for five minutes each. The first action stops one of the test instances, which AWS FIS chooses randomly. The second action stops both test instances. 

**To create an experiment template**

1. Open the AWS FIS console at https://console.aws.amazon.com/fis/
2. In the navigation pane, choose **Experiment templates**.
3. Choose **Create experiment template**. 
4. Enter a description for the template.
5. For **IAM role**, select the IAM role that you created earlier. 
6. For **Actions**, choose **Add action**. Complete the following information:    
   - For **Name**, enter a name for the action, for example, StopOneInstance. 
   - For **Action type**, choose **aws:ec2:stop-instances**. 
   - For **startInstancesAfterDuration**, enter 5. This represents a five-minute duration. 
7. Choose **Save**. 
8. For **Targets**, choose **Edit** for the target that AWS FIS automatically created for you in the previous step. Complete the following steps:    
   - For **Name**, replace the default name with a more descriptive name, for example, OneRandomInstance. 
   - For **Resource type**, ensure that aws:ec2:instance is selected. 
   - For **Target method**, choose **Resource IDs**, and then choose the IDs of the two test instances that you created earlier. 
   - For **Selection mode**, choose **COUNT**. For **Number of resources**, enter 1. 
9. Choose **Save**. 
10. Choose **Add target**. Complete the following information:   
    - For **Name**, enter a name, for example, AllInstances. 
    - For **Resource type**, select aws:ec2:instance. 
    - For **Target method**, choose **Resource IDs**, and then choose the IDs of the two test instances that you created earlier. 
    - For **Selection mode**, choose **ALL**. 
11. Choose **Save**. 
12. Return to the *Actions* section and choose **Add action**. Complete the following information: 
    - For **Name**, enter a name for the action, for example, StopAllInstances. 
    Allowed characters are alphanumeric characters, hyphens (-), and underscores(_). The name must start with a letter. No spaces are allowed. Each action name in      the template must be unique. 
    - For **Action type**, choose **aws:ec2:stop-instances** 
    - For **Start after**, choose the name of the action that you added earlier (StopOneInstance). 
    - For **Target**, choose the name of the target that you added in the preceding step (AllInstances). 
    - For **startInstancesAfterDuration**, enter 5. 
13. Choose **Save**. 
14. For **Stop conditions**, select the CloudWatch alarms that you created earlier. 
15. (Optional) For **Tags**, choose *Add new tag* and specify a tag key and tag value. 
16. Choose **Create experiment template**. 


## Start the experiment
When you have finished creating your experiment template, you can use it to start an experiment.

To start an experiment
1. Open the AWS FIS console at https://console.aws.amazon.com/fis/
2. In the navigation pane, choose Experiment templates.
3. Select the experiment template, and choose Actions, Start experiment.
4. (Optional) Choose Actions, Manage tags to add tags for your experiment, and then follow the steps in the console. Then choose Start experiment.

## View the experiment
You can view the progress of a running experiment until the experiment is completed, stopped, or failed. 
**To view an experiment**

1. Open the AWS FIS console at https://console.aws.amazon.com/fis/
2. In the navigation pane, choose **Experiments**. 
3. Select the **Experiment ID** to open the details page for the experiment. 
4. To view the state of the experiment, check **State** in the **Details** pane. For more information, see experiment states (https://docs.aws.amazon.com/fis/latest/userguide/experiments.html#experiment-states)


## Clean up

If you no longer need the test EC2 instances that you created for this experiment, you can terminate them. 
**To terminate an instance using the Amazon EC2 console**

1. Open the Amazon EC2 console at https://console.aws.amazon.com/ec2/
2. In the navigation pane, choose **Instances**. 
3. Select the instance, and choose **Actions**, **Instance State**, **Terminate**. 
4. Choose **Yes, Terminate** when prompted for confirmation. Repeat the preceding steps for the second instance. 

If you no longer need the experiment template, you can delete it.
**To delete an experiment template using the AWS FIS console**

1. Open the AWS FIS console at https://console.aws.amazon.com/fis/
2. In the navigation pane, choose **Experiment templates*. 
3. Select the experiment template, and choose **Actions**, **Delete experiment template**. 
4. Enter delete when prompted for confirmation, and then choose **Delete experiment template**. 











