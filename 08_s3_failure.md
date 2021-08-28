# Chaos Engineering for EC2-based Applications

## 8. Test S3 Failure
**S3 failure injection**
1. Failure of S3 means that the image will not be available
2. You may ONLY do this testing if you supplied your own `websiteimage` reference to an S3 bucket you control

**Bucket name**

You will need to know the bucket name where your image is. For example if the `websiteimage` value you supplied was `"https://s3.us-east-2.amazonaws.com/my-awesome-bucketname/my_image.jpg"`, then the bucket name is `my-awesome-bucketname`

For this failure simulation it is most straightforward to use the AWS Console as follows. (If you are interested in doing this <a href="https://www.wellarchitectedlabs.com/reliability/300_labs/300_testing_for_resiliency_of_ec2_rds_and_s3/documentation/s3_with_aws_cli/">using the AWS CLI then see here</a> - choose <i>either</i> AWS Console or AWS CLI)

<u>AWS Console</u>

1. Navigate to the S3 console: https://console.aws.amazon.com/s3
2. Select the bucket name where the image is located
3. Select the object, then select the “Permissions” tab
4. Select the “Public Access” radio button, and deselect the “Read object” checkbox and Save
5. To re-enable access (after testing), do the same steps, tick the “Read object” checkbox and Save

**System response to S3 failure**

What is the expected effect? How long does it take to take effect?

*  Note that due to browser caching you may still see the image on refreshing the site. On most systems Shift-F5 does a clean refresh with no cache

How would you diagnose if this is a larger problem than permissions?
