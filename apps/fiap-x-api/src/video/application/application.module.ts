import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfraModule } from '../infra/infra.module';
import { CreateVideoHandler } from './commands/create-video.handler';
import { ProcessSnapshotsResultHandler } from './commands/process-snapshots-result.handler';
import { ProcessingCompletedHandler } from './event-handlers/processing-completed.handler';
import { DownloadMyContentHandler } from './query/download-my-content.handler';
import { GetMyVideoHandler } from './query/get-my-video.handler';
import { ListMyVideosHandler } from './query/list-my-videos.handler';

const QueryHandlers = [
  GetMyVideoHandler,
  ListMyVideosHandler,
  DownloadMyContentHandler,
];
const CommandHandlers = [CreateVideoHandler, ProcessSnapshotsResultHandler];
const EventHandlers = [ProcessingCompletedHandler];

@Module({
  imports: [CqrsModule, InfraModule],
  providers: [...QueryHandlers, ...CommandHandlers, ...EventHandlers],
})
export class ApplicationModule {}
