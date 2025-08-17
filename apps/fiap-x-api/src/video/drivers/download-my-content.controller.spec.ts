import { User } from '@fiap-x/setup/auth';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { DownloadMyContentQuery } from '../application/query/download-my-content.query';
import { DownloadMyContentController } from './download-my-content.controller';

describe('DownloadMyContentController', () => {
  let target: DownloadMyContentController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HttpModule, ConfigModule],
      controllers: [DownloadMyContentController],
    }).compile();

    target = app.get(DownloadMyContentController);
    queryBus = app.get(QueryBus);
  });

  const user = new User({
    id: new Types.ObjectId().toHexString(),
    name: 'Jack Sparrow',
    email: 'jack@sparrow.com',
  });

  it('should execute DownloadMyContentQuery', async () => {
    const id = randomUUID();
    jest.spyOn(queryBus, 'execute').mockResolvedValue({ data: { id } });
    const result = await target.execute(randomUUID(), user, 'zip');
    expect(queryBus.execute).toHaveBeenCalledWith(
      new DownloadMyContentQuery({
        id: expect.any(String),
        target: 'zip',
        ownerId: user.id,
      }),
    );
    expect(result.id).toBe(id);
  });

  it('should throw if QueryBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);
    await expect(() =>
      target.execute(randomUUID(), user, 'zip'),
    ).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(
      new DownloadMyContentQuery({
        id: expect.any(String),
        target: 'zip',
        ownerId: user.id,
      }),
    );
  });
});
