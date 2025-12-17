import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminProductsService {
  constructor(private prisma: PrismaService) {}

  // Получение полной ветки категорий для товара
  async getCategoryPath(categoryId: number): Promise<string[]> {
    const path: string[] = [];

    let current = await this.prisma.category.findUnique({
      where: { categoryId },
      select: { name: true, parentId: true },
    });

    while (current) {
      path.unshift(current.name);
      if (!current.parentId) break;

      current = await this.prisma.category.findUnique({
        where: { categoryId: current.parentId },
        select: { name: true, parentId: true },
      });
    }

    return path;
  }

  // Получение списка товаров с пагинацией
  async getProducts(page: number, limit: number) {
    const safePage = page > 0 ? page : 1;
    const safeLimit = Math.min(limit || 20, 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: safeLimit,
        orderBy: { productId: 'desc' },
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          category: {
            select: {
              categoryId: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  // Получение товара по айди с характеристиками и категорией
  async getProductById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        characteristics: {
          select: {
            value: true,
            valueType: true,
            characteristicName: {
              select: { characteristicNameId: true, name: true },
            },
          },
        },
        category: { select: { categoryId: true, parentId: true, name: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const categoryPath = await this.getCategoryPath(product.categoryId);

    return {
      ...product,
      categoryPath,
    };
  }

  // Обновление товара вместе с характеристиками
  async updateProduct(productId: number, data: any) {
    const existing = await this.prisma.product.findUnique({ where: { productId } });
    if (!existing) throw new NotFoundException('Product not found');

    const { name, price, isNew, categoryId, characteristics } = data;

    return this.prisma.$transaction(async (prisma) => {
      // Обновляем основные поля
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: { name, price, isNew, categoryId },
      });

      if (characteristics && Array.isArray(characteristics)) {
        // Удаляем старые характеристики
        await prisma.productCharacteristic.deleteMany({ where: { productId } });

        // Вставляем новые
        const createData = characteristics.map((c) => ({
          productId,
          characteristicNameId: c.characteristicNameId,
          value: c.value,
          valueType: c.valueType,
        }));

        await prisma.productCharacteristic.createMany({
          data: createData,
          skipDuplicates: true,
        });
      }

      return updatedProduct;
    });
  }
}
