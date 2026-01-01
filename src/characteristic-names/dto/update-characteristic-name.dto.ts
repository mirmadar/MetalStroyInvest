import { IsOptional, IsString } from 'class-validator';

export class UpdateCharacteristicNameDto {
  @IsOptional()
  @IsString({ message: 'Название характеристики должно быть строкой' })
  readonly name?: string;
}
