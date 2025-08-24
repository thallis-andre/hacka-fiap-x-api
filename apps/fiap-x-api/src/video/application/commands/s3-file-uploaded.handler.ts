import { Transactional } from '@fiap-x/tactical-design/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VideoRepository } from '../abstractions/video.repository';
import { S3FileUploadedCommand, S3FileUploadedResult } from './s3-file-uploaded.command';

@CommandHandler(S3FileUploadedCommand)
export class S3FileUploadedHandler
  implements ICommandHandler<S3FileUploadedCommand, S3FileUploadedResult>
{
  constructor(private readonly repository: VideoRepository) {}

  @Transactional()
  async execute(command: S3FileUploadedCommand): Promise<S3FileUploadedResult> {
    const { bucketName, objectKey } = command.data;
    
    // Extract videoId from object key (format: ownerId/videoId)
    const pathParts = objectKey.split('/');
    if (pathParts.length !== 2) {
      return new S3FileUploadedResult({ processed: false });
    }
    
    const [ownerId, videoId] = pathParts;
    
    // Find the video by ID
    const video = await this.repository.findById(videoId);
    if (!video || video.ownerId !== ownerId) {
      return new S3FileUploadedResult({ processed: false });
    }

    // Only trigger the event if video is in 'new' status
    if (video.status === 'new') {
      video.create('AWS::S3', bucketName, objectKey);
      await this.repository.update(video);
      await video.commit();
    }

    return new S3FileUploadedResult({ processed: true });
  }
}