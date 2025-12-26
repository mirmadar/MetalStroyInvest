export class UpdateProductCharacteristicDto {
  id?: number; // вот это поле нужно
  name: string;
  value: string;
  valueType: 'number' | 'text';
}
