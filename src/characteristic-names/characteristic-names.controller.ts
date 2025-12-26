import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import express from 'express'; // <--- импортируем
import { CharacteristicNamesService } from './characteristic-names.service';
import { CreateCharacteristicNameDto } from './dto/create-characteristic-name.dto';
import { UpdateCharacteristicNameDto } from './dto/update-characteristic-name.dto';

@Controller('/characteristic-names')
export class CharacteristicNamesController {
  constructor(private readonly service: CharacteristicNamesService) {}

  @Get()
  async findAll(@Res() res: express.Response) {
    const data = await this.service.findAll();
    const total = data.length;

    // Заголовки для react-admin
    res.setHeader('Content-Range', `characteristic-names 0-${total - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    // Отправка JSON
    res.status(200).json(data); // <--- используем status(200).json()
  }

  @Post()
  async create(@Body() dto: CreateCharacteristicNameDto) {
    return this.service.create(dto.name);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCharacteristicNameDto) {
    return this.service.update(id, dto.name);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
