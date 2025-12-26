// products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { CategoriesService } from 'src/categories/categories.service';

// ==========================
// Типы
// ==========================

// Запросы React Admin
export interface FindAllQuery {
  range?: string;
  sort?: string;
  filter?: string;
  page?: string;
  perPage?: string;
  order?: string;
}

// Типы для парсинга React Admin
export interface RangeArray extends Array<number> {
  0: number;
  1: number;
}

export interface SortArray extends Array<string> {
  0: string;
  1: string;
}

// Фильтры для List
export interface ProductFilter {
  name?: string;
  isNew?: boolean;
  categoryId?: number;
}

// Тип для category path
export type CategoryPathItem = {
  id: number;
  name: string;
};

// Тип для одиночной категории из Prisma
export type CategoryNode = Prisma.CategoryGetPayload<{
  select: {
    categoryId: true;
    name: true;
    parentId: true;
  };
}>;

// Тип для product с leaf category (для findOne)
export type ProductWithCategory = Prisma.ProductGetPayload<{
  select: {
    productId: true;
    name: true;
    price: true;
    isNew: true;
    imageUrl: true;
    category: {
      select: {
        categoryId: true;
        name: true;
        parentId: true;
      };
    };
  };
}>;

// Тип характеристики для фронта
export type ProductCharacteristicItem = {
  id: number;
  name: string;
  value: string;
};

// ==========================
// Сервис
// ==========================
@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
  ) {}

  // ==========================
  // LIST
  // ==========================
  async findAll(query: FindAllQuery) {
    let page = 1;
    let perPage = 25;
    let sortField: 'productId' | 'name' | 'price' | 'isNew' = 'productId';
    let sortOrder: 'asc' | 'desc' = 'asc';

    // ===== SORT + PAGINATION =====
    if (query.range && query.sort) {
      try {
        const range: RangeArray = JSON.parse(query.range) as RangeArray;
        const sort: SortArray = JSON.parse(query.sort) as SortArray;

        perPage = range[1] - range[0] + 1;
        page = Math.floor(range[0] / perPage) + 1;

        const field = sort[0];
        if (['id', 'productId', 'name', 'price', 'isNew'].includes(field)) {
          sortField = field === 'id' ? 'productId' : (field as typeof sortField);
        }

        sortOrder = sort[1].toLowerCase() === 'desc' ? 'desc' : 'asc';
      } catch {
        // оставляем дефолт
      }
    } else {
      // Старые параметры
      page = Number(query.page) || 1;
      perPage = Math.min(Number(query.perPage) || 25, 100);
      if (query.sort && ['id', 'productId', 'name', 'price', 'isNew'].includes(query.sort)) {
        sortField = query.sort === 'id' ? 'productId' : (query.sort as typeof sortField);
      }
      sortOrder = query.order?.toLowerCase() === 'desc' ? 'desc' : 'asc';
    }

    const skip = (page - 1) * perPage;

    // ===== FILTER =====
    let filters: ProductFilter = {};
    if (query.filter) {
      try {
        filters = JSON.parse(query.filter) as ProductFilter;
      } catch {
        filters = {};
      }
    }

    const where: Prisma.ProductWhereInput = {};
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (typeof filters.isNew === 'boolean') {
      where.isNew = filters.isNew;
    }
    if (typeof filters.categoryId === 'number') {
      where.categoryId = filters.categoryId;
    }

    // ===== QUERY =====
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { [sortField]: sortOrder },
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          category: { select: { categoryId: true, name: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        id: p.productId,
        name: p.name,
        price: p.price,
        isNew: p.isNew,
        category: { id: p.category.categoryId, name: p.category.name },
      })),
      total,
    };
  }

  // ==========================
  // SHOW
  // ==========================
  async findOne(id: number) {
    const product: ProductWithCategory | null = await this.prisma.product.findUnique({
      where: { productId: id },
      select: {
        productId: true,
        name: true,
        price: true,
        isNew: true,
        imageUrl: true,
        category: { select: { categoryId: true, name: true, parentId: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    // ===== CATEGORY PATH =====
    const categoryPath: CategoryPathItem[] = [];
    let currentCategoryId: number | null = product.category.categoryId;

    while (currentCategoryId !== null) {
      const category: CategoryNode | null = await this.prisma.category.findUnique({
        where: { categoryId: currentCategoryId },
        select: { categoryId: true, name: true, parentId: true },
      });

      if (!category) break;

      categoryPath.unshift({ id: category.categoryId, name: category.name });
      currentCategoryId = category.parentId;
    }

    // ===== CHARACTERISTICS =====
    const characteristics = await this.prisma.productCharacteristic.findMany({
      where: { productId: id },
      select: {
        productCharacteristicId: true,
        value: true,
        characteristicName: { select: { name: true } },
      },
      orderBy: { productCharacteristicId: 'asc' },
    });

    const formattedCharacteristics: ProductCharacteristicItem[] = characteristics.map((c) => ({
      id: c.productCharacteristicId,
      name: c.characteristicName.name,
      value: c.value,
    }));

    return {
      id: product.productId,
      name: product.name,
      price: product.price,
      isNew: product.isNew,
      imageUrl: product.imageUrl,
      category: {
        id: product.category.categoryId,
        name: product.category.name,
        path: categoryPath,
      },
      characteristics: formattedCharacteristics,
    };
  }

  // ==========================
  // CREATE
  // ==========================
  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({ data: dto });
    return { id: product.productId, ...product, productId: undefined };
  }

  // ==========================
  // UPDATE
  // ==========================
  async patchProduct(id: number, dto: UpdateProductDto) {
    if (!dto || Object.keys(dto).length === 0) {
      // ничего не обновляем, просто возвращаем существующий продукт
      return this.findOne(id);
    }

    return this.prisma.product.update({
      where: { productId: id },
      data: dto,
    });
  }

  // ==========================
  // DELETE
  // ==========================
  async remove(id: number) {
    const product = await this.prisma.product.delete({ where: { productId: id } });
    return { id: product.productId };
  }
}
