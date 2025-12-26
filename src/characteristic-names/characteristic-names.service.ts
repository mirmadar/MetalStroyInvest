import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CharacteristicNamesService {
  constructor(private prisma: PrismaService) {}

  // Получить все характеристики
  async findAll() {
    return this.prisma.characteristicName.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByName(name: string) {
    return this.prisma.characteristicName.findUnique({ where: { name } });
  }

  // Создать характеристику
  async create(name: string) {
    return this.prisma.characteristicName.create({ data: { name } });
  }

  // Обновить характеристику
  async update(id: number, name: string) {
    return this.prisma.characteristicName.update({
      where: { characteristicNameId: id },
      data: { name },
    });
  }

  // Удалить характеристику
  async remove(id: number) {
    return this.prisma.characteristicName.delete({
      where: { characteristicNameId: id },
    });
  }
}
