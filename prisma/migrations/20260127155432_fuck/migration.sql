/*
  Warnings:

  - You are about to drop the `PrinterDefinition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `apiKey` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `currentJobId` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `definitionId` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `isAutoEjectCapable` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Printer` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Printer` table. All the data in the column will be lost.
  - Added the required column `buildVolumeX` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildVolumeY` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildVolumeZ` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `make` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Printer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technology` to the `Printer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PrinterDefinition_make_model_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PrinterDefinition";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPrinter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "apiKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "type" TEXT NOT NULL DEFAULT 'FDM',
    "isAutoEjectCapable" BOOLEAN NOT NULL DEFAULT false,
    "currentJobId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "printerId" TEXT,
    "userId" TEXT,
    CONSTRAINT "UserPrinter_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserPrinter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "gcodePath" TEXT,
    "widthMm" REAL NOT NULL DEFAULT 0.0,
    "depthMm" REAL NOT NULL DEFAULT 0.0,
    "heightMm" REAL NOT NULL DEFAULT 0.0,
    "estimatedTime" INTEGER NOT NULL DEFAULT 0,
    "filamentGrams" REAL NOT NULL DEFAULT 0.0,
    "thumbnailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Model" ("createdAt", "estimatedTime", "filamentGrams", "filePath", "gcodePath", "id", "name", "thumbnailUrl") SELECT "createdAt", "estimatedTime", "filamentGrams", "filePath", "gcodePath", "id", "name", "thumbnailUrl" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
CREATE TABLE "new_PrintJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "printerId" TEXT,
    "modelId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "autoEjectTriggered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userPrinterId" TEXT,
    CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_userPrinterId_fkey" FOREIGN KEY ("userPrinterId") REFERENCES "UserPrinter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PrintJob" ("autoEjectTriggered", "createdAt", "endTime", "id", "modelId", "printerId", "startTime", "status") SELECT "autoEjectTriggered", "createdAt", "endTime", "id", "modelId", "printerId", "startTime", "status" FROM "PrintJob";
DROP TABLE "PrintJob";
ALTER TABLE "new_PrintJob" RENAME TO "PrintJob";
CREATE TABLE "new_Printer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "buildVolumeX" REAL NOT NULL,
    "buildVolumeY" REAL NOT NULL,
    "buildVolumeZ" REAL NOT NULL,
    "technology" TEXT NOT NULL,
    "maxPowerConsumptionW" INTEGER,
    "priceUsd" REAL,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "features" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Printer" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Printer";
DROP TABLE "Printer";
ALTER TABLE "new_Printer" RENAME TO "Printer";
CREATE UNIQUE INDEX "Printer_make_model_key" ON "Printer"("make", "model");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserPrinter_ipAddress_key" ON "UserPrinter"("ipAddress");
