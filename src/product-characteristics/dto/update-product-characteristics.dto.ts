import { CreateProductCharacteristicDto } from './create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './update-product-characteristic.dto';

export class UpdateProductCharacteristicsDto {
  add?: CreateProductCharacteristicDto[];
  update?: UpdateProductCharacteristicDto[];
  delete?: number[];
}
