-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('number', 'text');

-- CreateTable
CREATE TABLE "characteristics_names_list" (
    "characteristicNameId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "characteristics_names_list_pkey" PRIMARY KEY ("characteristicNameId")
);

-- CreateTable
CREATE TABLE "product_characteristics" (
    "productCharacteristicId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "characteristicNameId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" "ValueType" NOT NULL,

    CONSTRAINT "product_characteristics_pkey" PRIMARY KEY ("productCharacteristicId")
);

-- AddForeignKey
ALTER TABLE "product_characteristics" ADD CONSTRAINT "product_characteristics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_characteristics" ADD CONSTRAINT "product_characteristics_characteristicNameId_fkey" FOREIGN KEY ("characteristicNameId") REFERENCES "characteristics_names_list"("characteristicNameId") ON DELETE RESTRICT ON UPDATE CASCADE;
