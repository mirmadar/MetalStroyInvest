// products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface FindAllQuery {
  range?: string;
  sort?: string;
  filter?: string;
  page?: string;
  perPage?: string;
  order?: string;
}

interface RangeArray extends Array<number> {
  0: number;
  1: number;
}

interface SortArray extends Array<string> {
  0: string;
  1: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindAllQuery) {
    // Определяем параметры
    let page = 1;
    let perPage = 25;
    let sortField = 'productId';
    let sortOrder: 'asc' | 'desc' = 'asc';

    // Если пришли параметры React Admin
    if (query.range && query.sort) {
      try {
        // Явная типизация при парсинге
        const range: RangeArray = JSON.parse(query.range) as RangeArray;
        const sort: SortArray = JSON.parse(query.sort) as SortArray;

        // Проверка типов для безопасности
        if (
          !Array.isArray(range) ||
          range.length !== 2 ||
          typeof range[0] !== 'number' ||
          typeof range[1] !== 'number'
        ) {
          throw new Error('Invalid range format');
        }

        if (
          !Array.isArray(sort) ||
          sort.length !== 2 ||
          typeof sort[0] !== 'string' ||
          typeof sort[1] !== 'string'
        ) {
          throw new Error('Invalid sort format');
        }

        perPage = range[1] - range[0] + 1;
        page = Math.floor(range[0] / perPage) + 1;

        sortField = sort[0];
        if (sortField === 'id') sortField = 'productId';
        sortOrder = sort[1].toLowerCase() as 'asc' | 'desc';
      } catch (error) {
        console.warn('Error parsing React Admin params:', error);
      }
    } else {
      // Старые параметры
      page = Number(query.page) || 1;
      perPage = Math.min(Number(query.perPage) || 25, 100);
      sortField = query.sort || 'productId';
      if (sortField === 'id') sortField = 'productId';
      sortOrder = query.order === 'DESC' ? 'desc' : 'asc';
    }

    const skip = (page - 1) * perPage;

    // Получаем данные
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: perPage,
        orderBy: {
          [sortField]: sortOrder,
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products.map((p) => ({
        id: p.productId,
        ...p,
        productId: undefined,
      })),
      total,
    };
  }

  // ... остальные методы без изменений
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId: id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.productId,
      ...product,
      productId: undefined,
    };
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: dto,
    });

    return {
      id: product.productId,
      ...product,
      productId: undefined,
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { productId: id },
      data: dto,
    });

    return {
      id: product.productId,
      ...product,
      productId: undefined,
    };
  }

  async remove(id: number) {
    const product = await this.prisma.product.delete({
      where: { productId: id },
    });

    return {
      id: product.productId,
    };
  }
}
