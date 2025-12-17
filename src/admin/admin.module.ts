import { Module } from '@nestjs/common';
import { AdminProductsModule } from './products/products.module';

@Module({
  imports: [AdminProductsModule],
})
export class AdminModule {}
