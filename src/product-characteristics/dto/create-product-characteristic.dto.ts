import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProductCharacteristicDto {
  @IsString({ message: 'Название характеристики должно быть строкой' })
  @IsNotEmpty({ message: 'Название характеристики не может быть пустым' })
  readonly name: string;

  @IsNotEmpty({ message: 'Значение характеристики обязательно' })
  readonly value: string | number;
}
