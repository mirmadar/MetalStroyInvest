import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateProductCharacteristicDto {
  @IsNumber({}, { message: 'ID характеристики должен быть числом' })
  readonly id: number;

  @IsNotEmpty({ message: 'Значение характеристики обязательно' })
  readonly value: string | number;
}
