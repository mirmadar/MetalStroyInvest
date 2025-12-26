import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
  Res,
  Put,
} from '@nestjs/common';
import { UpdateProductCharacteristicsDto } from 'src/product-characteristics/dto/update-product-characteristics.dto';
import { ProductCharacteristicsService } from 'src/product-characteristics/product-characteristics.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import type { FindAllQuery, ProductCharacteristicItem } from './products.service';
import express from 'express';

@Controller('/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productCharacteristicsService: ProductCharacteristicsService,
  ) {}

  // ===== LIST =====
  @Get()
  async findAll(@Query() query: FindAllQuery, @Res() res: express.Response) {
    const { data, total } = await this.productsService.findAll(query);

    // Определяем диапазон
    let start = 0;
    let end = data.length > 0 ? data.length - 1 : 0;

    if (query.range) {
      try {
        const range = JSON.parse(query.range) as [number, number];
        start = range[0];
        end = Math.min(range[1], total - 1);
      } catch {
        /* empty */
      }
    }

    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.setHeader('Content-Range', `products ${start}-${end}/${total}`);

    return res.json(data);
  }

  // ===== SHOW =====
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // ===== CREATE =====
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { product: UpdateProductDto; characteristics?: UpdateProductCharacteristicsDto },
  ) {
    const updatedProduct = await this.productsService.patchProduct(id, body.product);

    // Явно указываем тип массива
    let updatedCharacteristics: ProductCharacteristicItem[] = [];

    if (body.characteristics) {
      updatedCharacteristics = await this.productCharacteristicsService.patchProductCharacteristics(
        id,
        body.characteristics,
      );
    }

    return {
      ...updatedProduct,
      characteristics: updatedCharacteristics,
    };
  }
  // ===== PATCH product =====
  @Patch(':id')
  async patchProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.patchProduct(id, dto);
  }

  // ===== PATCH characteristics =====
  @Patch(':id/characteristics')
  async patchCharacteristics(
    @Param('id', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductCharacteristicsDto,
  ) {
    return this.productCharacteristicsService.patchProductCharacteristics(productId, dto);
  }

  // ===== DELETE =====
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
