import { ReloadContext } from '@fiap-x/setup';
import {
  RabbitSubscribe,
  defaultNackErrorHandler,
  requeueErrorHandler,
} from '@golevelup/nestjs-rabbitmq';
import {
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  applyDecorators,
} from '@nestjs/common';
import { Message } from 'amqplib';
import { randomUUID } from 'crypto';
import { AmqpInterceptor } from '../interceptors/amqp.interceptor';
import {
  ChannelsFromDecoratorsContainer,
  FailedPolicyException,
  QueuesFromDecoratorsContainer,
} from '../utils/amqp.internals';
import { Binding } from './amqp-binding.decorator';

type SubscriptionOptions = {
  exchange: string;
  routingKey: string;
  queue: string;
  channel?: string;
  prefetch?: number;
};

/**
 * Decorator responsible for declaringa an AMQP subscription.
 *
 * @param {SubscriptionOptions} opts - configuration object specifying:
 *
 * - `exchange` - The exchange to bind this handler.
 * - `routingKey` - The binding routing key.
 * - `queue` - The queue that will be bound to the exchange.
 * - `channel` - The dedicated channel used in this handler.
 * - `prefetch` - The number of messages to prefetch for this channel.
 *
 * @publicApi
 */

export const AmqpSubscription = ({
  exchange,
  routingKey,
  queue,
  channel,
  prefetch,
}: SubscriptionOptions) => {
  channel = channel ?? randomUUID().split('-')[0];
  QueuesFromDecoratorsContainer.add(queue);
  ChannelsFromDecoratorsContainer.push({
    name: channel,
    prefetchCount: prefetch,
  });
  return applyDecorators(
    RabbitSubscribe({
      exchange,
      routingKey,
      queue,
      createQueueIfNotExists: true,
      queueOptions: { channel },
      errorHandler: (channel, message, error) => {
        if (error instanceof FailedPolicyException) {
          return requeueErrorHandler(channel, message, error);
        }
        return defaultNackErrorHandler(channel, message, error);
      },
    }),
    ReloadContext({
      // TODO: not sure I like this approach
      interceptorSetup: (context, executionContext) => {
        const message = executionContext.switchToRpc().getContext<Message>();
        const id = message.properties?.headers?.['x-context-id'];
        context.setId(id);
      },
    }),
    Binding({ exchange, routingKey, queue }),
    UsePipes(ValidationPipe),
    UseInterceptors(AmqpInterceptor),
  );
};
