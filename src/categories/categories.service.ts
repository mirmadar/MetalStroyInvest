import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryPathItemDto } from './dto/category-path-item.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ==========================
  // CREATE
  // ==========================
  async create(dto: CreateCategoryDto) {
    let level = 0;
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { categoryId: dto.parentId },
        select: { level: true },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
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

  // ==========================
  // UPDATE
  // ==========================
  async update(id: number, dto: UpdateCategoryDto) {
    let level: number | undefined = undefined;
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { categoryId: dto.parentId },
        select: { level: true },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      level = parent.level + 1;
    }

    const category = await this.prisma.category.update({
      where: { categoryId: id },
      data: {
        name: dto.name,
        parentId: dto.parentId,
        imageUrl: dto.imageUrl,
        ...(level !== undefined ? { level } : {}),
      },
    });

    return category;
  }

  // ==========================
  // FIND ONE + CATEGORY PATH
  // ==========================
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId: id },
    });
    if (!category) throw new NotFoundException('Category not found');

    const path: CategoryPathItemDto[] = [];

    // current может быть null
    let current: Category | null = category;

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

    return {
      ...category,
      path,
    };
  }

  // ==========================
  // FIND ALL
  // ==========================
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { level: 'asc', name: 'asc' },
    });
  }

  // Метод для построения полного пути категории
  async findPath(categoryId: number): Promise<CategoryPathItemDto[]> {
    const path: CategoryPathItemDto[] = [];
    let current = await this.prisma.category.findUnique({
      where: { categoryId },
    });

    if (!current) throw new NotFoundException('Category not found');

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

  // ==========================
  // DELETE
  // ==========================
  async remove(id: number) {
    return this.prisma.category.delete({
      where: { categoryId: id },
    });
  }
}
