import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly name: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID родительской категории должен быть числом' })
  readonly parentId?: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;
}
