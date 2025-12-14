import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomepageService {
 
  constructor(private prisma: PrismaService) {}

  async getHomepage() {
    const categories = await this.prisma.category.findMany({
      where: {
        parentId: null, // мб надо сделать через level
      },
      take: 4,
    //   orderBy: {
    //     name: 'asc',
    //   },
      select: {
        categoryId: true,
        name: true,
        imageUrl: true,
      },
    });

    const newProducts = await this.prisma.product.findMany({
      take: 4,
      where: {
        isNew: true,
      },
      select: {
        productId: true,
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    return {
      categories,
      newProducts,
    };
  }
}
