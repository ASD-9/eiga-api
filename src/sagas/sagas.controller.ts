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
import { SagasService } from './sagas.service';
import { SagaDto } from './dto/saga.dto';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { SagaResponseDto } from './dto/saga-response.dto';

@Controller('sagas')
export class SagasController {
  constructor(private readonly sagasService: SagasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSagasDto: SagaDto): Promise<SagaResponseDto> {
    return this.sagasService.create(createSagasDto);
  }

  @Get()
  findAll(): Promise<SagaResponseDto[]> {
    return this.sagasService.findAll();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateSagasDto: SagaDto,
  ): Promise<void> {
    return this.sagasService.update(id, updateSagasDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.sagasService.remove(id);
  }
}
