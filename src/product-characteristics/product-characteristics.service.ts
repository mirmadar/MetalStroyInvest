import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CharacteristicNamesService } from 'src/characteristic-names/characteristic-names.service';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { UpdateProductCharacteristicsDto } from './dto/update-product-characteristics.dto';

@Injectable()
export class ProductCharacteristicsService {
  constructor(
    private prisma: PrismaService,
    private characteristicNamesService: CharacteristicNamesService,
  ) {}

  // ==========================
  // PATCH (orchestrator)
  // ==========================
  async patchProductCharacteristics(productId: number, dto: UpdateProductCharacteristicsDto) {
    if (dto.delete?.length) {
      await this.deleteCharacteristics(productId, dto.delete);
    }

    if (dto.update?.length) {
      await this.updateCharacteristics(dto.update);
    }

    if (dto.add?.length) {
      await this.addCharacteristics(productId, dto.add);
    }

    return this.getProductCharacteristics(productId);
  }

  // ==========================
  // ADD
  // ==========================
  private async addCharacteristics(productId: number, items: CreateProductCharacteristicDto[]) {
    for (const item of items) {
      const charName = await this.characteristicNamesService.findByName(item.name);
      if (!charName) {
        throw new Error(`Characteristic "${item.name}" not found`);
      }

      await this.prisma.productCharacteristic.create({
        data: {
          productId,
          characteristicNameId: charName.characteristicNameId,
          value: item.value,
          valueType: item.valueType,
        },
      });
    }
  }

  // ==========================
  // UPDATE
  // ==========================
  private async updateCharacteristics(items: UpdateProductCharacteristicDto[]) {
    for (const item of items) {
      if (!item.id) continue;

      await this.prisma.productCharacteristic.update({
        where: { productCharacteristicId: item.id },
        data: { value: item.value, valueType: item.valueType },
      });
    }
  }

  // ==========================
  // DELETE
  // ==========================
  private async deleteCharacteristics(productId: number, ids: number[]) {
    await this.prisma.productCharacteristic.deleteMany({
      where: { productId, productCharacteristicId: { in: ids } },
    });
  }

  // ==========================
  // GET characteristics for a product
  // ==========================
  private async getProductCharacteristics(productId: number) {
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

  // ==========================
  // CREATE single characteristic (optional)
  // ==========================
  async createCharacteristic(productId: number, dto: CreateProductCharacteristicDto) {
    const charName = await this.characteristicNamesService.findByName(dto.name);
    if (!charName) {
      throw new Error(`Characteristic "${dto.name}" not found`);
    }

    const characteristic = await this.prisma.productCharacteristic.create({
      data: {
        productId,
        characteristicNameId: charName.characteristicNameId,
        value: dto.value,
        valueType: dto.valueType,
      },
    });

    return {
      id: characteristic.productCharacteristicId,
      name: dto.name,
      value: characteristic.value,
      valueType: characteristic.valueType,
    };
  }

  // ==========================
  // DELETE single characteristic (optional)
  // ==========================
  async deleteCharacteristic(productId: number, characteristicId: number) {
    await this.prisma.productCharacteristic.deleteMany({
      where: { productId, productCharacteristicId: characteristicId },
    });
  }
}
