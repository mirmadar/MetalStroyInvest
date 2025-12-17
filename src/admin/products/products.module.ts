import { Module } from '@nestjs/common';
import { AdminProductsController } from './products.controller';
import { AdminProductsService } from './products.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService, PrismaModule],
})
export class AdminProductsModule {}
