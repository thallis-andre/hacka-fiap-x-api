import { DomainEvent } from '@fiap-x/tactical-design/core';
import { VideoStatusValues } from '../values/video-status.value';

export class ProcessingCompleted extends DomainEvent {
  constructor(
    public readonly ownerId: string,
    public readonly filename: string,
    public readonly status: VideoStatusValues,
    public readonly downloadSignedUrl: string,
    public readonly failReason?: string,
  ) {
    super();
  }
}
