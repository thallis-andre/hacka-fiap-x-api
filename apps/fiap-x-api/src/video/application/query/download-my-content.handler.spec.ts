import { FakeMongooseModel } from '@fiap-x/test-factory/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { EVideoStatus } from '../../domain/values/video-status.value';
import { AwsS3VideoStorageService } from '../../infra/adapters/storage/aws-s3/aws-s3-storage.service';
import { MongooseVideoSchema } from '../../infra/persistence/mongoose/video.schema';
import { StorageService } from '../abstractions/storage.service';
import { DownloadMyContentHandler } from './download-my-content.handler';
import { DownloadMyContentQuery } from './download-my-content.query';

describe('DownloadMyContentHandler', () => {
  let target: DownloadMyContentHandler;
  let model: FakeMongooseModel<MongooseVideoSchema>;
  let storage: StorageService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadMyContentHandler,
        {
          provide: getModelToken(MongooseVideoSchema.name),
          useClass: FakeMongooseModel,
        },
        {
          provide: StorageService,
          useValue: Object.create(AwsS3VideoStorageService.prototype),
        },
      ],
    }).compile();
    target = moduleFixture.get(DownloadMyContentHandler);
    model = moduleFixture.get(getModelToken(MongooseVideoSchema.name));
    storage = moduleFixture.get(StorageService);
    jest
      .spyOn(storage, 'createSignedUrlForDownload')
      .mockResolvedValue('signed-url');
  });

  const getSchema = () => {
    const schema: MongooseVideoSchema = {
      _id: new Types.ObjectId(),
      ownerId: new Types.ObjectId(),
      filename: 'video.mp4',
      snapshotIntervalInSeconds: 10,
      status: EVideoStatus.Processed,
      videoFile: { provider: 'test', bucket: 'test', path: 'test' },
      zipFile: { provider: 'test', bucket: 'test', path: 'test' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return schema;
  };
  it('should return a download url', async () => {
    const schema = getSchema();
    jest.spyOn(model, 'exec').mockResolvedValue(schema);
    const result = await target.execute(
      new DownloadMyContentQuery({
        id: new Types.ObjectId().toHexString(),
        target: 'zip',
        ownerId: new Types.ObjectId().toHexString(),
      }),
    );
    expect(result.data.downloadSignedUrl).toEqual(expect.any(String));
  });

  it('should throw not found if object does not exist', async () => {
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    await expect(
      async () =>
        await target.execute(
          new DownloadMyContentQuery({
            id: new Types.ObjectId().toHexString(),
            target: 'zip',
            ownerId: new Types.ObjectId().toHexString(),
          }),
        ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw bad request if target is not valid', async () => {
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    await expect(
      async () =>
        await target.execute(
          new DownloadMyContentQuery({
            id: new Types.ObjectId().toHexString(),
            target: 'dummy',
            ownerId: new Types.ObjectId().toHexString(),
          }),
        ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw bad request if target does not exist in object', async () => {
    const schema = getSchema();
    schema.zipFile = null;
    jest.spyOn(model, 'exec').mockResolvedValue(schema);
    await expect(
      async () =>
        await target.execute(
          new DownloadMyContentQuery({
            id: new Types.ObjectId().toHexString(),
            target: 'zip',
            ownerId: new Types.ObjectId().toHexString(),
          }),
        ),
    ).rejects.toThrow(BadRequestException);
  });
});
