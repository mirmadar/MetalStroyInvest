import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCharacteristicNameDto {
  @IsOptional()
  @IsString({ message: 'Название характеристики должно быть строкой' })
  readonly name?: string;

  @IsOptional()
  @IsIn(['number', 'text'], { message: 'valueType должен быть "number" или "text"' })
  readonly valueType?: 'number' | 'text';
}
