import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomepageModule } from './homepage/homepage.module';

@Module({
  imports: [PrismaModule, ProductsModule, HomepageModule],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}