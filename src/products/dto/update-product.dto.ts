import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  readonly name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  readonly price?: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'Новинка должна быть булевым значением' })
  readonly isNew?: boolean;
}
