import { IsIn, IsString } from 'class-validator';

export class CreateCharacteristicNameDto {
  @IsString({ message: 'Название характеристики должно быть строкой' })
  readonly name: string;

  @IsIn(['number', 'text'], { message: 'valueType должен быть "number" или "text"' })
  readonly valueType: 'number' | 'text';
}
