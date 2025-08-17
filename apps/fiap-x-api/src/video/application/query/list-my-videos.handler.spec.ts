import { FakeMongooseModel } from '@fiap-x/test-factory/utils';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { EVideoStatus } from '../../domain/values/video-status.value';
import { MongooseVideoSchema } from '../../infra/persistence/mongoose/video.schema';
import { ListMyVideosHandler } from './list-my-videos.handler';
import { ListMyVideosQuery } from './list-my-videos.query';

describe('ListMyVideos', () => {
  let target: ListMyVideosHandler;
  let model: FakeMongooseModel<MongooseVideoSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ListMyVideosHandler,
        {
          provide: getModelToken(MongooseVideoSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();
    target = moduleFixture.get(ListMyVideosHandler);
    model = moduleFixture.get(getModelToken(MongooseVideoSchema.name));
  });

  it('should return a list of videos when found', async () => {
    const schema: MongooseVideoSchema = {
      _id: new Types.ObjectId(),
      filename: 'video.mp4',
      ownerId: new Types.ObjectId(),
      snapshotIntervalInSeconds: 10,
      status: EVideoStatus.Processed,
      videoFile: { provider: 'test', bucket: 'test', path: 'test' },
      zipFile: { provider: 'test', bucket: 'test', path: 'test' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(model, 'exec').mockResolvedValue([schema]);
    const result = await target.execute(
      new ListMyVideosQuery({ ownerId: new Types.ObjectId().toHexString() }),
    );
    const hexId = schema._id.toHexString();
    const actual = result.data[0];
    expect(result.data.length).toBe(1);
    expect(actual.id).toBe(hexId);
    expect(actual.filename).toBe(schema.filename);
    expect(actual.status).toBe(schema.status);
    expect(actual.videoPath).toBe(`/me/videos/${hexId}/download?target=video`);
    expect(actual.zipPath).toBe(`/me/videos/${hexId}/download?target=zip`);
    expect(actual.snapshotIntervalInSeconds).toBe(
      schema.snapshotIntervalInSeconds,
    );
    expect(actual.updatedAt).toBeDefined();
    expect(actual.updatedAt).toBeDefined();
  });

  it('should return empty list if no videos were found', async () => {
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    const result = await target.execute(
      new ListMyVideosQuery({ ownerId: new Types.ObjectId().toHexString() }),
    );
    expect(result.data.length).toBe(0);
  });
});
