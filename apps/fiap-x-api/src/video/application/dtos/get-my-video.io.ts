import { MyVideo } from './my-video.dto';

export class GetMyVideoInput {
  public readonly id: string;
  public readonly ownerId: string;
}

export class GetMyVideoOutput extends MyVideo {}
