import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    let level = 0;

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { categoryId: dto.parentId },
        select: { level: true },
      });

      if (!parent) {
        throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
      }

      level = parent.level + 1;
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? null,
        imageUrl: dto.imageUrl ?? null,
        level,
      },
    });

    return category;
  }

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { level: 'asc', name: 'asc' },
    });

    return categories;
  }

  async getCategoryById(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const path = await this.findPath(categoryId);

    return {
      ...category,
      path,
    };
  }

  async updateCategory(categoryId: number, dto: UpdateCategoryDto) {
    await this.getCategoryOrFail(categoryId);

    const updateData: {
      name?: string;
      parentId?: number | null;
      imageUrl?: string | null;
      level?: number;
    } = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.imageUrl !== undefined) {
      updateData.imageUrl = dto.imageUrl;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updateData.parentId = null;
        updateData.level = 0;
      } else {
        const parent = await this.prisma.category.findUnique({
          where: { categoryId: dto.parentId },
          select: { level: true },
        });

        if (!parent) {
          throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
        }

        updateData.parentId = dto.parentId;
        updateData.level = parent.level + 1;
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { categoryId },
      data: updateData,
    });

    return updatedCategory;
  }

  async deleteCategory(categoryId: number) {
    await this.getCategoryOrFail(categoryId);

    await this.prisma.category.delete({
      where: { categoryId },
    });

    return { message: 'Категория удалена' };
  }

  async findPath(categoryId: number) {
    const path: Array<{ id: number; name: string; imageUrl?: string }> = [];
    let current = await this.prisma.category.findUnique({
      where: { categoryId },
    });

    if (!current) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    while (current) {
      path.unshift({
        id: current.categoryId,
        name: current.name,
        imageUrl: current.imageUrl ?? undefined,
      });

      if (!current.parentId) break;

      current = await this.prisma.category.findUnique({
        where: { categoryId: current.parentId },
      });
    }

    return path;
  }

  async getCategoryOrFail(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      select: { categoryId: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    return category;
  }
}
