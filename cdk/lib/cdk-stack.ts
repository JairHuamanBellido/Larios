import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { config } from "dotenv";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as lambda from "aws-cdk-lib/aws-lambda";

config();
export class LariosCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucketName = process.env.BUCKET_NAME || "larios-bucket";

    const s3Bucket = new s3.Bucket(this, bucketName, {
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const lambdaTriggerS3 = new lambda.Function(
      this,
      "larios-lambda-s3-trigger",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.lambdaHandler",
        functionName: "larios-lambda-s3-trigger",
        code: lambda.Code.fromAsset("lambda/larios-s3-trigger/dist"),
      }
    );

    s3Bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(lambdaTriggerS3)
    );
  }
}
