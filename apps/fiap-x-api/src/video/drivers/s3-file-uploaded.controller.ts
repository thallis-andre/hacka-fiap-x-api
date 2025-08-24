import { AmqpSubscription, AmqpPayload } from '@fiap-x/amqp';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { S3FileUploadedCommand } from '../application/commands/s3-file-uploaded.command';

interface S3EventRecord {
  eventName: string;
  s3: {
    bucket: {
      name: string;
    };
    object: {
      key: string;
    };
  };
}

interface S3Event {
  Records: S3EventRecord[];
}

@Controller()
export class S3FileUploadedController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 's3.events',
    routingKey: 'object.created',
    queue: 'fiap-x-api.s3-file-uploaded',
  })
  async handle(@AmqpPayload() event: S3Event) {
    for (const record of event.Records) {
      if (record.eventName.startsWith('ObjectCreated:')) {
        const { bucket, object } = record.s3;
        await this.commandBus.execute(
          new S3FileUploadedCommand({
            bucketName: bucket.name,
            objectKey: object.key,
          }),
        );
      }
    }
  }
}