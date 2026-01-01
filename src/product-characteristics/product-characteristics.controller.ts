import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { ProductCharacteristicsService } from './product-characteristics.service';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { UpdateProductCharacteristicsDto } from './dto/update-product-characteristics.dto';

@Controller('product-characteristics')
export class ProductCharacteristicsController {
  constructor(private readonly productCharacteristicsService: ProductCharacteristicsService) {}

  // Получение всех характеристик конкретного товара
  @Get('product/:productId')
  async getByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.productCharacteristicsService.getProductCharacteristics(productId);
  }

  // Добавление новой характеристики к товару
  @Post('product/:productId')
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductCharacteristicDto,
  ) {
    return this.productCharacteristicsService.createCharacteristic(productId, dto);
  }

  // Обновление нескольких характеристик товара за один запрос
  @Patch('product/:productId')
  async updateMultiple(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductCharacteristicsDto,
  ) {
    return this.productCharacteristicsService.updateProductCharacteristics(productId, dto);
  }

  // Обновление одной конкретной характеристики
  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductCharacteristicDto,
  ) {
    return this.productCharacteristicsService.updateCharacteristic(id, dto);
  }

  // Удаление конкретной характеристики
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productCharacteristicsService.deleteCharacteristic(id);
  }
}
