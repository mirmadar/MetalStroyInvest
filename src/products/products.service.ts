import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { ProductCharacteristicsService } from 'src/product-characteristics/product-characteristics.service';
import { UpdateProductCharacteristicsDto } from 'src/product-characteristics/dto/update-product-characteristics.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
    private productCharacteristicsService: ProductCharacteristicsService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: createProductDto.name,
          price: createProductDto.price,
          imageUrl: createProductDto.imageUrl ?? null,
          isNew: createProductDto.isNew ?? false,
        },
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          imageUrl: true,
        },
      });

      // Если есть характеристики — добавляем через сервис характеристик
      if (createProductDto.characteristics?.length) {
        await this.productCharacteristicsService.addCharacteristics(
          product.productId,
          createProductDto.characteristics,
          tx, // передаём транзакцию, чтобы всё было атомарно
        );
      }

      return product;
    });
  }

  async getAllProducts(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: { productId: 'desc' },
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          category: { select: { name: true } },
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      total,
      page,
      pageSize,
      data: products.map((p) => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        isNew: p.isNew,
        categoryName: p.category?.name ?? null,
      })),
    };
  }

  async getProductById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      select: {
        productId: true,
        name: true,
        price: true,
        isNew: true,
        imageUrl: true,
        categoryId: true,
      },
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    // Получаем путь категории
    const categoryPath = product.categoryId
      ? await this.categoriesService.findPath(product.categoryId)
      : [];

    // Получаем характеристики
    const characteristics =
      await this.productCharacteristicsService.getProductCharacteristics(productId);

    return {
      ...product,
      category: {
        id: product.categoryId,
        path: categoryPath,
      },
      characteristics,
    };
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto,
    updateCharacteristicsDto?: UpdateProductCharacteristicsDto,
  ) {
    await this.getProductOrFail(productId);

    return await this.prisma.$transaction(async (tx) => {
      // Обновляем продукт
      const updateData: {
        name?: string;
        price?: number;
        imageUrl?: string;
        isNew?: boolean;
      } = {};

      if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
      if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
      if (updateProductDto.imageUrl !== undefined) updateData.imageUrl = updateProductDto.imageUrl;
      if (updateProductDto.isNew !== undefined) updateData.isNew = updateProductDto.isNew;

      const updatedProduct = await tx.product.update({
        where: { productId },
        data: updateData,
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          imageUrl: true,
        },
      });

      // Обновляем характеристики через сервис, передаем транзакцию
      if (updateCharacteristicsDto) {
        if (updateCharacteristicsDto.delete?.length) {
          await this.productCharacteristicsService.deleteCharacteristics(
            productId,
            updateCharacteristicsDto.delete,
            tx,
          );
        }

        if (updateCharacteristicsDto.update?.length) {
          await this.productCharacteristicsService.updateCharacteristics(
            updateCharacteristicsDto.update,
            tx,
          );
        }

        if (updateCharacteristicsDto.add?.length) {
          await this.productCharacteristicsService.addCharacteristics(
            productId,
            updateCharacteristicsDto.add,
            tx,
          );
        }
      }

      return updatedProduct;
    });
  }

  async deleteProduct(productId: number) {
    await this.getProductOrFail(productId);

    // Удаляем товар вместе с его характеристиками в транзакции
    await this.prisma.$transaction(async (tx) => {
      // Сначала удаляем все характеристики товара
      await tx.productCharacteristic.deleteMany({
        where: { productId },
      });

      // Затем удаляем сам товар
      await tx.product.delete({
        where: { productId },
      });
    });

    return { message: 'Товар удален' };
  }

  private async getProductOrFail(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      select: { productId: true },
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    return product;
  }
}
