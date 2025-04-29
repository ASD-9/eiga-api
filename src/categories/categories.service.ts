import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CategoryDto): Promise<CategoryResponseDto> {
    try {
      return plainToInstance(
        CategoryResponseDto,
        await this.categoriesRepository.save(createCategoryDto),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    try {
      return plainToInstance(
        CategoryResponseDto,
        await this.categoriesRepository.find(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<CategoryResponseDto> {
    try {
      const category = await this.categoriesRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException(`Catégorie ${id} introuvable`);
      }
      return plainToInstance(CategoryResponseDto, category);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateCategoryDto: CategoryDto): Promise<void> {
    try {
      const result: UpdateResult = await this.categoriesRepository.update(
        id,
        updateCategoryDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Catégorie ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result: DeleteResult = await this.categoriesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Catégorie ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
