import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class DownloadMyContentInput {
  @ApiProperty()
  @IsString()
  public readonly id: string;

  @ApiProperty()
  @IsString()
  public readonly ownerId: string;

  @ApiProperty()
  @IsString()
  @IsEnum(['zip', 'video'])
  public readonly target: string;
}

export class DownloadMyContentOutput {
  @ApiProperty()
  downloadSignedUrl: string;

  constructor(values: DownloadMyContentOutput) {
    Object.assign(this, values);
  }
}
