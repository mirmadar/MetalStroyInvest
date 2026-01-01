import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, ValidateNested } from 'class-validator';
import { CreateProductCharacteristicDto } from 'src/product-characteristics/dto/create-product-characteristic.dto';

export class CreateProductDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly name: string;

  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  readonly price: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'Новинка должна быть булевым значением' })
  readonly isNew?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductCharacteristicDto)
  readonly characteristics?: CreateProductCharacteristicDto[];
}
