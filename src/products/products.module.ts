import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductCharacteristicsModule } from 'src/product-characteristics/product-characteristics.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
  imports: [ProductCharacteristicsModule, CategoriesModule],
})
export class ProductsModule {}
