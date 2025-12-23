export class CreateProductDto {
  name: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  isNew?: boolean;
}
