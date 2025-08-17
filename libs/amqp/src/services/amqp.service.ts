import { ContextService } from '@fiap-x/setup';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { MessageProperties } from 'amqplib';
import { randomUUID } from 'crypto';
import { AmqpInspectionService } from './amqp-inspection.service';

@Injectable()
export class AmqpService {
  constructor(
    private readonly amqp: AmqpConnection,
    private readonly inspector: AmqpInspectionService,
    private readonly contextService: ContextService,
  ) {}

  async publish(
    exchange: string,
    routingKey: string,
    content: object,
    properties?: MessageProperties,
  ) {
    const messageProperties = this.getMessageProperties(properties);
    await this.publishWithInspection(
      exchange,
      routingKey,
      content,
      messageProperties,
    );
  }

  async sendToQueue(
    queue: string,
    content: object,
    properties?: MessageProperties,
  ) {
    const targetContent =
      content instanceof Buffer
        ? content
        : Buffer.from(JSON.stringify(content));
    const messageProperties = this.getMessageProperties(properties);
    await this.publishWithInspection(
      '',
      queue,
      targetContent,
      messageProperties,
    );
  }

  private factoryHeaders(headers?: MessageProperties['headers']) {
    const contextId = this.contextService.getId();
    return {
      ...(headers ?? {}),
      'x-context-id': headers?.['x-context-id'] ?? contextId,
    };
  }

  private factoryMessageId(id: any) {
    return id ?? randomUUID();
  }

  private getMessageProperties(properties?: MessageProperties) {
    return {
      ...properties,
      headers: this.factoryHeaders(properties?.headers),
      messageId: this.factoryMessageId(properties?.messageId),
    };
  }

  private async publishWithInspection(
    exchange: string,
    routingKey: string,
    content: object,
    properties?: MessageProperties,
  ) {
    const err = await this.amqp
      .publish(exchange, routingKey, content, properties)
      .then(() => null)
      .catch((error) => error);

    this.inspector.inspectOutbound(
      exchange,
      routingKey,
      content,
      properties,
      err,
    );

    if (err) {
      throw err;
    }
  }
}
