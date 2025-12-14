import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importCharacteristicNames() {
  const file = fs.readFileSync(
    path.join(__dirname, '../../../MSI_parser/characteristics_names_list/characteristics_names_list.json'),
    'utf-8'
  )
  const names = JSON.parse(file)

  // upsert безопаснее — не создаёт дубликаты
  for (const n of names) {
    await prisma.characteristicName.upsert({
      where: { characteristicNameId: n.characteristic_name_id },
      update: {},
      create: {
        characteristicNameId: n.characteristic_name_id,
        name: n.name,
      },
    })
  }
}

async function main() {
  await importCharacteristicNames()
  console.log('Characteristic names imported')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
