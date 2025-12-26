import { Module } from '@nestjs/common';
import { ProductCharacteristicsService } from './product-characteristics.service';
import { ProductCharacteristicsController } from './product-characteristics.controller';
import { CharacteristicNamesModule } from 'src/characteristic-names/characteristic-names.module';

@Module({
  providers: [ProductCharacteristicsService],
  controllers: [ProductCharacteristicsController],
  exports: [ProductCharacteristicsService],
  imports: [CharacteristicNamesModule],
})
export class ProductCharacteristicsModule {}
