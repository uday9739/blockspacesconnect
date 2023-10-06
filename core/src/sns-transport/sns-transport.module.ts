import { Module} from "@nestjs/common";
import {
  SnsTransportClient,
  SnsTransportServerOptions,
  SNS_CLIENT
} from './sns-transport-client';
import { EnvironmentVariables, ENV_TOKEN } from '../env';
import { EnvModule } from '../env/EnvModule'

const SnsTransportClientFactoryObj = {
  provide: 'SNS_CLIENT',
  useFactory: (env: EnvironmentVariables): SnsTransportClient => {
    const options: SnsTransportServerOptions = {
      accessKeyId: env.aws.awsAccessKeyId,
      secretAccessKey: env.aws.awsSecretAccessKey,
      region: env.aws.awsRegion,
      topicArn: env.aws.snsTopicArn,
    };
    return new SnsTransportClient(options);
  },
  inject: [ENV_TOKEN],
};

@Module({
  providers: [SnsTransportClientFactoryObj],
  imports: [ EnvModule],
  exports: ['SNS_CLIENT'],
})
export class SnsTransportModule {}