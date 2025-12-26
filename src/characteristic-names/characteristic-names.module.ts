import { Module } from '@nestjs/common';
import { CharacteristicNamesService } from './characteristic-names.service';
import { CharacteristicNamesController } from './characteristic-names.controller';

@Module({
  providers: [CharacteristicNamesService],
  controllers: [CharacteristicNamesController],
  exports: [CharacteristicNamesService],
})
export class CharacteristicNamesModule {}
