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
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { CategoryResponseDto } from './dto/category-response.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateCategoryDto: CategoryDto,
  ): Promise<void> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
