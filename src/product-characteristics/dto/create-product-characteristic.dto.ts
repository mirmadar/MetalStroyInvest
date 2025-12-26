export class CreateProductCharacteristicDto {
  name: string;
  value: string;
  valueType: 'number' | 'text';
}
