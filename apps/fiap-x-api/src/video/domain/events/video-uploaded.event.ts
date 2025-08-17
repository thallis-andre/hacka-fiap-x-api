import { FileUploaded } from './file.uploaded.event';

export class VideoUploaded extends FileUploaded {
  constructor(
    public readonly provider: string,
    public readonly bucket: string,
    public readonly path: string,
    public readonly snapshotIntervalInSeconds: number,
  ) {
    super(provider, bucket, path);
  }
}
