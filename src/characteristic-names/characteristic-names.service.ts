import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCharacteristicNameDto } from './dto/create-characteristic-name.dto';
import { UpdateCharacteristicNameDto } from './dto/update-characteristic-name.dto';

@Injectable()
export class CharacteristicNamesService {
  constructor(private prisma: PrismaService) {}

  // Создание нового названия характеристики
  async createCharacteristicName(dto: CreateCharacteristicNameDto) {
    await this.ensureNameUnique(dto.name);

    return this.prisma.characteristicName.create({
      data: { name: dto.name.trim() },
    });
  }

  // Получение всех названий характеристик
  async getAllCharacteristicNames() {
    return this.prisma.characteristicName.findMany({ orderBy: { name: 'asc' } });
  }

  // Получение названия характеристики по ID
  async getCharacteristicNameById(id: number) {
    return this.getCharacteristicNameOrFail(id);
  }

  // Обновление названия характеристики
  async updateCharacteristicName(id: number, dto: UpdateCharacteristicNameDto) {
    await this.getCharacteristicNameOrFail(id);

    if (!dto.name) {
      throw new BadRequestException('Название характеристики обязательно для обновления');
    }

    await this.ensureNameUnique(dto.name, id);

    return this.prisma.characteristicName.update({
      where: { characteristicNameId: id },
      data: { name: dto.name.trim() },
    });
  }

  // Удаление названия характеристики
  async deleteCharacteristicName(id: number) {
    await this.getCharacteristicNameOrFail(id);

    await this.prisma.characteristicName.delete({ where: { characteristicNameId: id } });
    return { message: 'Название характеристики удалено' };
  }

  // Поиск по имени (для ProductCharacteristicsService)
  async findByName(name: string) {
    return this.prisma.characteristicName.findUnique({ where: { name: name.trim() } });
  }

  // Вспомогательный метод: проверка существования по ID
  private async getCharacteristicNameOrFail(id: number) {
    const name = await this.prisma.characteristicName.findUnique({
      where: { characteristicNameId: id },
    });
    if (!name) throw new NotFoundException('Название характеристики не найдено');
    return name;
  }

  // Вспомогательный метод: проверка уникальности имени
  private async ensureNameUnique(name: string, id?: number) {
    const existing = await this.prisma.characteristicName.findUnique({
      where: { name: name.trim() },
    });
    if (existing && existing.characteristicNameId !== id) {
      throw new BadRequestException(`Название характеристики "${name}" уже существует`);
    }
  }
}
