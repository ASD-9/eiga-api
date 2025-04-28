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
} from '@nestjs/common';
import { NationalitiesService } from './nationalities.service';
import { NationalityDto } from './dto/nationality.dto';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { NationalityResponseDto } from './dto/nationality-response.dto';

@Controller('nationalities')
export class NationalitiesController {
  constructor(private readonly nationalitiesService: NationalitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createNationalityDto: NationalityDto,
  ): Promise<NationalityResponseDto> {
    return this.nationalitiesService.create(createNationalityDto);
  }

  @Get()
  findAll(): Promise<NationalityResponseDto[]> {
    return this.nationalitiesService.findAll();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateNationalityDto: NationalityDto,
  ): Promise<void> {
    return this.nationalitiesService.update(id, updateNationalityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.nationalitiesService.remove(id);
  }
}
