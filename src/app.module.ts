import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomepageModule } from './homepage/homepage.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CharacteristicNamesModule } from './characteristic-names/characteristic-names.module';
import { ProductCharacteristicsModule } from './product-characteristics/product-characteristics.module';

@Module({
  imports: [PrismaModule, ProductsModule, HomepageModule, UsersModule, RolesModule, AuthModule, CategoriesModule, CharacteristicNamesModule, ProductCharacteristicsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
