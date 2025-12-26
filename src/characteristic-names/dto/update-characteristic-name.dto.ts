import { IsString } from 'class-validator';

export class UpdateCharacteristicNameDto {
  @IsString({ message: 'Название характеристики должно быть строкой' })
  readonly name: string;
}
