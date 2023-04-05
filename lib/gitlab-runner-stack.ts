import { Stack, type StackProps } from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import {
  CfnInstance,
  EbsDeviceVolumeType,
  type InstanceType,
  SecurityGroup,
  Vpc
} from 'aws-cdk-lib/aws-ec2'
import {
  CfnInstanceProfile,
  ManagedPolicy,
  Role,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface GitlabRunnerStackProps extends StackProps {
  registrationToken: string
  vpcId: string
  subnetId: string
  ec2InstanceName: string
  ec2KeyName: string
  ec2VolumeSizeGb: number
  ec2InstanceType: InstanceType
}

export class GitlabRunnerStack extends Stack {
  constructor (scope: Construct, id: string, props: GitlabRunnerStackProps) {
    super(scope, id, props)

    const vpc = Vpc.fromLookup(this, 'vpc', {
      vpcId: props.vpcId
    })

    const sg = new SecurityGroup(this, 'gitlab-runner-sg', {
      vpc,
      allowAllOutbound: true
    })

    const role = new Role(this, 'gitlab-runner-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
      ]
    })

    const instanceProfile = new CfnInstanceProfile(this, 'ip', {
      instanceProfileName: 'gitlab-runner-cc',
      roles: [role.roleName]
    })

    let userDataScript = readFileSync(
      join(__dirname, '../../assets/gitlab-runner-install.sh'),
      'utf8'
    )
    userDataScript = userDataScript.replace(
      '<GITLAB_REGISTRATION_TOKEN>',
      props.registrationToken
    )
    const userDataScriptBase64 =
            Buffer.from(userDataScript).toString('base64')

    new CfnInstance(this, props.ec2InstanceName, {
      keyName: props.ec2KeyName,
      blockDeviceMappings: [
        {
          deviceName: '/dev/sda1',
          ebs: {
            deleteOnTermination: true,
            encrypted: false,
            volumeSize: props.ec2VolumeSizeGb,
            volumeType: EbsDeviceVolumeType.GP3
          }
        }
      ],
      imageId: 'ami-00aa9d3df94c6c354', // Ubuntu Server 22.04 LTS
      instanceType: props.ec2InstanceType.toString(),
      monitoring: false,
      networkInterfaces: [
        {
          deviceIndex: '0',
          associatePublicIpAddress: true,
          deleteOnTermination: true,
          subnetId: props.subnetId,
          groupSet: [sg.securityGroupId]
        }
      ],
      iamInstanceProfile: instanceProfile.instanceProfileName,
      userData: userDataScriptBase64
    })
  }
}
