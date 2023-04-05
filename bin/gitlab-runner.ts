#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GitlabRunnerStack } from '../lib/gitlab-runner-stack';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2'
import { config } from 'dotenv'

config({
  override: true
})
const app = new cdk.App();
new GitlabRunnerStack(app, 'GitlabRunnerStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT
  },
  registrationToken: process.env.CDK_GITLAB_REGISTRATION_TOKEN ?? '',
  vpcId: process.env.CDK_DEFAULT_VPC_ID ?? '',
  subnetId: process.env.CDK_RUNNER_SUBNET_ID ?? '',
  ec2KeyName: process.env.CDK_RUNNER_EC2_KEY_NAME ?? '',
  ec2InstanceName: process.env.CDK_RUNNER_EC2_INSTANCE_NAME ?? '',
  ec2InstanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
  ec2VolumeSizeGb: 100
});