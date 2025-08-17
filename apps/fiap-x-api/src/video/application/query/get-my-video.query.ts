import { GetMyVideoInput, GetMyVideoOutput } from '../dtos/get-my-video.io';

export class GetMyVideoQuery {
  constructor(public readonly data: GetMyVideoInput) {}
}

export class GetMyVideoResult {
  constructor(public readonly data: GetMyVideoOutput) {}
}
