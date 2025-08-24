import { Response } from '@fiap-x/setup/common';

export class S3FileUploadedCommand {
  constructor(
    public readonly data: {
      bucketName: string;
      objectKey: string;
    },
  ) {}
}

export class S3FileUploadedResult extends Response {
  constructor(data: { processed: boolean }) {
    super(data);
  }
}