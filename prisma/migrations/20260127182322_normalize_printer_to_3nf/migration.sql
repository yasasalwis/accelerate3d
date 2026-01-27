/*
  Warnings:

  - You are about to drop the column `features` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `make` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `technology` on the `Printer` table. All the data in the column will be lost.
  - Added the required column `manufacturerId` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technologyId` to the `Printer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrinterTechnology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrinterFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrinterFeatureMapping" (
    "printerId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    PRIMARY KEY ("printerId", "featureId"),
    CONSTRAINT "PrinterFeatureMapping_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrinterFeatureMapping_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "PrinterFeature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Printer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturerId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "buildVolumeX" REAL NOT NULL,
    "buildVolumeY" REAL NOT NULL,
    "buildVolumeZ" REAL NOT NULL,
    "maxPowerConsumptionW" INTEGER,
    "priceUsd" REAL,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Printer_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Printer_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "PrinterTechnology" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Printer" ("buildVolumeX", "buildVolumeY", "buildVolumeZ", "createdAt", "id", "imageUrl", "maxPowerConsumptionW", "model", "priceUsd", "sourceUrl", "updatedAt") SELECT "buildVolumeX", "buildVolumeY", "buildVolumeZ", "createdAt", "id", "imageUrl", "maxPowerConsumptionW", "model", "priceUsd", "sourceUrl", "updatedAt" FROM "Printer";
DROP TABLE "Printer";
ALTER TABLE "new_Printer" RENAME TO "Printer";
CREATE UNIQUE INDEX "Printer_manufacturerId_model_key" ON "Printer"("manufacturerId", "model");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterTechnology_name_key" ON "PrinterTechnology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterFeature_name_key" ON "PrinterFeature"("name");
