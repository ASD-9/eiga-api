import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { Avatar } from './entities/avatar.entity';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { AvatarDto } from './dto/avatar.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarUploadConfig } from '../common/upload.config';
import { FileCleanupInterceptor } from '../common/file.cleanup-interceptor';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileCleanupInterceptor,
    FileInterceptor('image', avatarUploadConfig),
  )
  create(
    @Body() createAvatarDto: AvatarDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Avatar> {
    if (!file) {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
    return this.avatarsService.create(createAvatarDto, file.filename);
  }

  @Get()
  findAll(): Promise<Avatar[]> {
    return this.avatarsService.findAll();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateAvatarDto: AvatarDto,
  ): Promise<void> {
    return this.avatarsService.update(id, updateAvatarDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.avatarsService.remove(id);
  }
}
