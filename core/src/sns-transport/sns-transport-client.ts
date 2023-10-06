import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import {
  PublishCommand,
  PublishCommandOutput,
  SNSClient,
} from '@aws-sdk/client-sns';

export const SNS_CLIENT = Symbol('SNS_CLIENT');

export declare type SnsTransportServerOptions = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  topicArn: string;
};

@Injectable()
export class SnsTransportClient extends ClientProxy {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  topicArn: string;
  snsClient: SNSClient;

  constructor(options: SnsTransportServerOptions) {
    super();

    this.accessKeyId = options.accessKeyId;
    this.secretAccessKey = options.secretAccessKey;
    this.region = options.region;
    this.topicArn = options.topicArn;
    // Create a new SNS client
    this.snsClient = new SNSClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async connect(): Promise<any> {
    return false;
  }

  async close() {
    this.snsClient.destroy();
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return await this.run(packet.pattern, packet.data);
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): () => void {
    this.run(packet.pattern, packet.data).then((response) => {
      callback({ response: response });
    });
    return () => {};
  }

  run = async (
    pattern: string,
    message: string,
  ): Promise<PublishCommandOutput> => {
    const params = {
      Message: message,
      TopicArn: this.topicArn,
      Subject: pattern,
    };
    try {
      return await this.snsClient.send(new PublishCommand(params)); // For unit tests.
    } catch (err) {
      console.log('Error', err.stack);
    }
  };
}
