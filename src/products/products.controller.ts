// products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Res,
  Options,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import express from 'express';

interface FindAllQuery {
  range?: string;
  sort?: string;
  filter?: string;
  page?: string;
  perPage?: string;
  order?: string;
}

interface RangeArray extends Array<number> {
  0: number;
  1: number;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Обработчик OPTIONS для CORS preflight
  @Options()
  options(@Res() res: express.Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.sendStatus(200);
  }

  // LIST
  @Get()
  async findAll(@Query() query: FindAllQuery, @Res() res: express.Response) {
    try {
      const { data, total } = await this.productsService.findAll(query);

      // Получаем параметры для заголовка Content-Range
      let start = 0;
      let end = data.length > 0 ? data.length - 1 : 0;

      if (query.range) {
        try {
          const range: RangeArray = JSON.parse(query.range) as RangeArray;

          // Проверка типов
          if (
            Array.isArray(range) &&
            range.length === 2 &&
            typeof range[0] === 'number' &&
            typeof range[1] === 'number'
          ) {
            start = range[0];
            end = Math.min(range[1], total - 1);
          }
        } catch (error) {
          // Если не удалось распарсить, используем defaults
          console.warn('Error parsing range:', error);
          end = Math.min(data.length - 1, total - 1);
        }
      }

      // Убеждаемся, что end не меньше start
      if (end < start) {
        end = start;
      }

      res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
      res.setHeader('Content-Range', `products ${start}-${end}/${total}`);

      return res.json(data);
    } catch (error) {
      console.error('Error in findAll:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // SHOW
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: express.Response) {
    try {
      const result = await this.productsService.findOne(+id);
      return res.json(result);
    } catch (error) {
      console.error('Error in findOne:', error);
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }

  // CREATE
  @Post()
  async create(@Body() dto: CreateProductDto, @Res() res: express.Response) {
    try {
      const result = await this.productsService.create(dto);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      console.error('Error in create:', error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  // UPDATE
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Res() res: express.Response,
  ) {
    try {
      const result = await this.productsService.update(+id, dto);
      return res.json(result);
    } catch (error) {
      console.error('Error in update:', error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  // DELETE
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: express.Response) {
    try {
      const result = await this.productsService.remove(+id);
      return res.json(result);
    } catch (error) {
      console.error('Error in remove:', error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }
}
