import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongooseVideoSchema } from '../../infra/persistence/mongoose/video.schema';
import { StorageService } from '../abstractions/storage.service';
import { DownloadMyContentOutput } from '../dtos/download-my-content.io';
import {
  DownloadMyContentQuery,
  DownloadMyContentResult,
} from './download-my-content.query';

@QueryHandler(DownloadMyContentQuery)
export class DownloadMyContentHandler
  implements IQueryHandler<DownloadMyContentQuery, DownloadMyContentResult>
{
  constructor(
    @InjectModel(MongooseVideoSchema.name)
    private readonly queryModel: Model<MongooseVideoSchema>,
    private readonly storage: StorageService,
  ) {}

  async execute(
    query: DownloadMyContentQuery,
  ): Promise<DownloadMyContentResult> {
    const { id, ownerId, target } = query.data;

    if (!['zip', 'video'].includes(target)) {
      throw new BadRequestException('Target must be either "zip" or "video"');
    }

    const result = await this.queryModel
      .findOne({
        _id: new Types.ObjectId(id),
        ownerId: new Types.ObjectId(ownerId),
      })
      .exec();

    if (!result) {
      throw new NotFoundException();
    }

    const key = `${target.toLowerCase()}File`;
    const targetFile = result[key];
    if (!targetFile) {
      throw new BadRequestException('Target does not exist in object');
    }
    const downloadSignedUrl = await this.storage.createSignedUrlForDownload(
      result[key].path,
    );

    return new DownloadMyContentResult(
      new DownloadMyContentOutput({ downloadSignedUrl }),
    );
  }
}
