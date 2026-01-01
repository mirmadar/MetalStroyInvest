import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CharacteristicNamesService } from 'src/characteristic-names/characteristic-names.service';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { UpdateProductCharacteristicsDto } from './dto/update-product-characteristics.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductCharacteristicsService {
  constructor(
    private prisma: PrismaService,
    private characteristicNamesService: CharacteristicNamesService,
  ) {}

  // Получение всех характеристик товара
  async getProductCharacteristics(productId: number) {
    const characteristics = await this.prisma.productCharacteristic.findMany({
      where: { productId },
      select: {
        productCharacteristicId: true,
        value: true,
        valueType: true,
        characteristicName: { select: { name: true } },
      },
      orderBy: { productCharacteristicId: 'asc' },
    });

    return characteristics.map((c) => ({
      id: c.productCharacteristicId,
      name: c.characteristicName.name,
      value: c.value,
      valueType: c.valueType,
    }));
  }

  // Добавление нескольких характеристик (с поддержкой транзакции)
  async addCharacteristics(
    productId: number,
    items: CreateProductCharacteristicDto[],
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;

    for (const item of items) {
      // Проверяем существование глобального названия характеристики
      const charName = await this.characteristicNamesService.findByName(item.name.trim());
      if (!charName) {
        throw new NotFoundException(`Характеристика "${item.name}" не найдена`);
      }

      try {
        await prisma.productCharacteristic.create({
          data: {
            productId,
            characteristicNameId: charName.characteristicNameId,
            value: String(item.value),
            valueType: typeof item.value === 'number' ? 'number' : 'text',
          },
        });
      } catch (error) {
        // Обработка уникальности для этого товара
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new BadRequestException(
            `Характеристика "${item.name}" уже существует для этого товара`,
          );
        }
        throw error;
      }
    }
  }

  // Обновление нескольких характеристик
  async updateCharacteristics(
    items: UpdateProductCharacteristicDto[],
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;

    for (const item of items) {
      try {
        const valueType = typeof item.value === 'number' ? 'number' : 'text';
        await prisma.productCharacteristic.update({
          where: { productCharacteristicId: item.id },
          data: { value: String(item.value), valueType },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new NotFoundException(`Характеристика с id ${item.id} не найдена`);
        }
        throw error;
      }
    }
  }

  // Удаление характеристик по списку ID
  async deleteCharacteristics(productId: number, ids: number[], tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    await prisma.productCharacteristic.deleteMany({
      where: { productId, productCharacteristicId: { in: ids } },
    });
  }

  // Добавление одной характеристики (для контроллера)
  async createCharacteristic(productId: number, dto: CreateProductCharacteristicDto) {
    // Проверяем существование глобального названия характеристики
    const charName = await this.characteristicNamesService.findByName(dto.name.trim());
    if (!charName) {
      throw new NotFoundException(`Характеристика "${dto.name}" не найдена`);
    }

    // Создаём характеристику и сразу выбираем нужные поля
    const created = await this.prisma.productCharacteristic.create({
      data: {
        productId,
        characteristicNameId: charName.characteristicNameId,
        value: String(dto.value),
        valueType: typeof dto.value === 'number' ? 'number' : 'text',
      },
      select: {
        productCharacteristicId: true,
        value: true,
        valueType: true,
        characteristicName: { select: { name: true } },
      },
    });

    return {
      id: created.productCharacteristicId,
      name: created.characteristicName.name,
      value: created.value,
      valueType: created.valueType,
    };
  }

  // Обновление одной характеристики (для контроллера)
  async updateCharacteristic(id: number, dto: UpdateProductCharacteristicDto) {
    await this.updateCharacteristics([{ id, value: dto.value }]);

    const updated = await this.prisma.productCharacteristic.findUnique({
      where: { productCharacteristicId: id },
      select: {
        productCharacteristicId: true,
        value: true,
        valueType: true,
        characteristicName: { select: { name: true } },
      },
    });

    if (!updated) {
      throw new NotFoundException('Характеристика не найдена');
    }

    return {
      id: updated.productCharacteristicId,
      name: updated.characteristicName.name,
      value: updated.value,
      valueType: updated.valueType,
    };
  }

  // Удаление одной характеристики (для контроллера)
  async deleteCharacteristic(id: number) {
    await this.getCharacteristicOrFail(id);
    await this.prisma.productCharacteristic.delete({
      where: { productCharacteristicId: id },
    });
    return { message: 'Характеристика удалена' };
  }

  // Обновление характеристик товара (для контроллера, с транзакцией)
  async updateProductCharacteristics(productId: number, dto: UpdateProductCharacteristicsDto) {
    return await this.prisma.$transaction(async (tx) => {
      if (dto.delete && dto.delete.length > 0) {
        await this.deleteCharacteristics(productId, dto.delete, tx);
      }

      if (dto.update && dto.update.length > 0) {
        await this.updateCharacteristics(dto.update, tx);
      }

      if (dto.add && dto.add.length > 0) {
        await this.addCharacteristics(productId, dto.add, tx);
      }

      return this.getProductCharacteristics(productId);
    });
  }

  // Получение одной характеристики по ID
  async getCharacteristicOrFail(id: number) {
    const characteristic = await this.prisma.productCharacteristic.findUnique({
      where: { productCharacteristicId: id },
    });

    if (!characteristic) {
      throw new NotFoundException('Характеристика не найдена');
    }
    return characteristic;
  }
}
