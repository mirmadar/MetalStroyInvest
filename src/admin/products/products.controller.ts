// admin-products.controller.ts
import { Controller, Get, Body, Patch, Query, Param, ParseIntPipe } from '@nestjs/common';
import { AdminProductsService } from './products.service';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  getProducts(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.adminProductsService.getProducts(Number(page), Number(limit));
  }

  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.getProductById(id);
  }

  @Patch(':id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminProductsService.updateProduct(id, body);
  }
}
