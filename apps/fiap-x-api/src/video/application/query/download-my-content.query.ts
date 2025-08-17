import {
  DownloadMyContentInput,
  DownloadMyContentOutput,
} from '../dtos/download-my-content.io';

export class DownloadMyContentQuery {
  constructor(public readonly data: DownloadMyContentInput) {}
}

export class DownloadMyContentResult {
  constructor(public readonly data: DownloadMyContentOutput) {}
}
