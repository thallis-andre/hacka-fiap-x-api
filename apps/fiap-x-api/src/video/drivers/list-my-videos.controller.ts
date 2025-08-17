import { AuthUser, User, WithAuthentication } from '@fiap-x/setup/auth';
import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListMyVideosOutput } from '../application/dtos/list-my-videos.io';
import { ListMyVideosQuery } from '../application/query/list-my-videos.query';

@ApiTags('Video')
@WithAuthentication()
@Controller({ version: '1', path: 'me/videos' })
export class ListMyVideosController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOkResponse({ type: [ListMyVideosOutput] })
  @Get()
  async execute(@AuthUser() user: User) {
    const result = await this.queryBus.execute(
      new ListMyVideosQuery({ ownerId: user.id }),
    );
    return result;
  }
}
