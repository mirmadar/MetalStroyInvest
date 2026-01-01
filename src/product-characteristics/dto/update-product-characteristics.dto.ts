import { IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductCharacteristicDto } from './create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './update-product-characteristic.dto';

export class UpdateProductCharacteristicsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductCharacteristicDto)
  readonly add?: CreateProductCharacteristicDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductCharacteristicDto)
  readonly update?: UpdateProductCharacteristicDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly delete?: number[];
}
