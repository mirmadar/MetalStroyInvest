import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        characteristics: {
          include: { characteristicName: true },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { productId: id },
      include: {
        category: true,
        characteristics: {
          include: { characteristicName: true },
        },
      },
    });
  }
}