import { AmqpService } from '@fiap-x/amqp';
import { routingKeyOf } from '@fiap-x/tactical-design/amqp';
import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ProcessingCompleted } from '../../domain/events/processing-completed.event';
import { ProcessingCompletedInput, ProcessingCompletedIntegration } from '../dtos/processing-completed.io';

@Injectable()
@EventsHandler(ProcessingCompleted)
export class ProcessingCompletedHandler
  implements IEventHandler<ProcessingCompleted>
{
  constructor(private readonly amqp: AmqpService) {}

  async handle(event: ProcessingCompleted): Promise<void> {
    const eventData = new ProcessingCompletedInput();
    eventData.ownerId = event.ownerId;
    eventData.filename = event.filename;
    eventData.status = event.status;
    eventData.downloadSignedUrl = event.downloadSignedUrl;
    eventData.failReason = event.failReason;

    const integrationEvent = new ProcessingCompletedIntegration(
      randomUUID(),
      randomUUID(), // aggregateId pode ser diferente
      ProcessingCompletedIntegration.name,
      new Date(),
      0,
      eventData,
    );

    await this.amqp.publish(
      'fiap.x.api.events',
      routingKeyOf('ProcessingCompleted'),
      integrationEvent,
    );
  }
}
