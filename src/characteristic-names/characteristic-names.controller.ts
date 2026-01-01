import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { CharacteristicNamesService } from './characteristic-names.service';
import { CreateCharacteristicNameDto } from './dto/create-characteristic-name.dto';
import { UpdateCharacteristicNameDto } from './dto/update-characteristic-name.dto';

@Controller('characteristic-names')
export class CharacteristicNamesController {
  constructor(private readonly characteristicNamesService: CharacteristicNamesService) {}

  @Post()
  async create(@Body() dto: CreateCharacteristicNameDto) {
    return this.characteristicNamesService.createCharacteristicName(dto);
  }

  @Get()
  async getAll() {
    return this.characteristicNamesService.getAllCharacteristicNames();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.characteristicNamesService.getCharacteristicNameById(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCharacteristicNameDto) {
    return this.characteristicNamesService.updateCharacteristicName(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.characteristicNamesService.deleteCharacteristicName(id);
  }
}
