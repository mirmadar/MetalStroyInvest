import { IsString } from 'class-validator';

export class CreateCharacteristicNameDto {
  @IsString({ message: 'Название характеристики должно быть строкой' })
  readonly name: string;
}
