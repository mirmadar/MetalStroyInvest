import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importCategories() {
  const file = fs.readFileSync(
    path.join(__dirname, '../../../MSI_parser/categories/categories_all.json'),
    'utf-8'
  )
  const categories = JSON.parse(file)

  for (const c of categories) {
      await prisma.category.upsert({
        where: { categoryId: c.category_id },
        update: {}, // ничего не меняем, если запись есть
        create: {
          categoryId: c.category_id,
          name: c.name,
          level: c.level,
          imageUrl: null,
          parentId: c.parent_id ?? null,
        },
      });
    }
}

async function main() {
  await importCategories()
  console.log('Categories imported')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
