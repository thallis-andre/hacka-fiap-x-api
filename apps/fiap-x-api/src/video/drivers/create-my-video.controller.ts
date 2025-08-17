import { AuthUser, User, WithAuthentication } from '@fiap-x/setup/auth';
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateVideoCommand } from '../application/commands/create-video.command';
import {
  CreateVideoInput,
  CreateVideoOutput,
} from '../application/dtos/create-video.io';

@ApiTags('Video')
@WithAuthentication()
@Controller({ version: '1', path: 'me/videos' })
export class CreateVideoController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiCreatedResponse({ type: CreateVideoOutput })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async execute(@Body() input: CreateVideoInput, @AuthUser() user: User) {
    input.ownerId = user.id;
    const result = await this.commandBus.execute(new CreateVideoCommand(input));
    return result.data;
  }
}
