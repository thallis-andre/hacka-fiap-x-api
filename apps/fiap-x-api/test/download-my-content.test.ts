import { destroyTestApp } from '@fiap-x/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { StorageService } from '../src/video/application/abstractions/storage.service';
import { createTestApp } from './create-app';
import { getBearerToken } from './utils/get-bearer-token';

describe('GET /v1/me/videos/{id}/download', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  it('should return not found if no videos exsit', async () => {
    const bearer = await getBearerToken(app);
    const id = new Types.ObjectId().toHexString();
    const response = await request(server)
      .get(`/v1/me/videos/${id}/download?target=zip`)
      .set('Authorization', bearer);
    const { statusCode } = response;
    expect(statusCode).toBe(404);
  });

  it('should return bad request if unknown target is provided', async () => {
    const bearer = await getBearerToken(app);
    const id = new Types.ObjectId().toHexString();
    const response = await request(server)
      .get(`/v1/me/videos/${id}/download?target=dummy`)
      .set('Authorization', bearer);
    const { statusCode } = response;
    expect(statusCode).toBe(400);
  });

  it('should return bad request if video exists but target does not', async () => {
    const storageService = await app.resolve(StorageService);
    jest
      .spyOn(storageService, 'createSignedUrlForDownload')
      .mockResolvedValue('dummy-signed-url');
    const bearer = await getBearerToken(app);
    const createResponse = await request(server)
      .post('/v1/me/videos')
      .send({
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      })
      .set('Authorization', bearer);
    const { id } = createResponse.body;

    const response = await request(server)
      .get(`/v1/me/videos/${id}/download?target=zip`)
      .set('Authorization', bearer);

    const { statusCode } = response;
    expect(statusCode).toBe(400);
  });

  it('should return signed download url', async () => {
    const storageService = await app.resolve(StorageService);
    jest
      .spyOn(storageService, 'createSignedUrlForDownload')
      .mockResolvedValue('dummy-signed-url');
    const bearer = await getBearerToken(app);
    const createResponse = await request(server)
      .post('/v1/me/videos')
      .send({
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      })
      .set('Authorization', bearer);
    const { id } = createResponse.body;

    const response = await request(server)
      .get(`/v1/me/videos/${id}/download?target=video`)
      .set('Authorization', bearer);

    const { statusCode, body } = response;
    expect(statusCode).toBe(200);
    expect(body.downloadSignedUrl).toEqual(expect.any(String));
  });
});
