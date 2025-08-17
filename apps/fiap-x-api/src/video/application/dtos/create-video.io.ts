import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVideoInput {
  ownerId: string;

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(/* istanbul ignore next */ () => Number)
  snapshotIntervalInSeconds?: number;
}

export class CreateVideoOutput {
  @ApiProperty()
  id: string;

  @ApiProperty()
  signedUrlForUpload: string;
}
