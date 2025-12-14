import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importProductCharacteristics() {
  for (let i = 1; i <= 37; i++) {
    const filePath = path.join(
      __dirname,
      `../../../MSI_parser/product_characteristics/product_characteristics_${i}.json`
    )
    const file = fs.readFileSync(filePath, 'utf-8')
    const items = JSON.parse(file)

    // батчи по 1000
    const batchSize = 1000
    for (let j = 0; j < items.length; j += batchSize) {
      const batch = items.slice(j, j + batchSize)
      await prisma.productCharacteristic.createMany({
        data: batch.map(item => ({
          productCharacteristicId: item.product_characteristic_id,
          productId: item.product_id,
          characteristicNameId: item.characteristic_name_id,
          value: item.value,
          valueType: item.value_type,
        })),
      })
    }
    console.log(`File ${i} imported`)
  }
}

async function main() {
  await importProductCharacteristics()
  console.log('All product characteristics imported')
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
