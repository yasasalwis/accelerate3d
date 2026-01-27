/*
  Warnings:

  - You are about to drop the column `printerId` on the `PrintJob` table. All the data in the column will be lost.
  - Made the column `userPrinterId` on table `PrintJob` required. This step will fail if there are existing NULL values in that column.
  - Made the column `printerId` on table `UserPrinter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `UserPrinter` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Model" ADD COLUMN "bedTempC" INTEGER;
ALTER TABLE "Model" ADD COLUMN "layerHeightMm" REAL;
ALTER TABLE "Model" ADD COLUMN "material" TEXT;
ALTER TABLE "Model" ADD COLUMN "nozzleTempC" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrintJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userPrinterId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "autoEjectTriggered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrintJob_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_userPrinterId_fkey" FOREIGN KEY ("userPrinterId") REFERENCES "UserPrinter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PrintJob" ("autoEjectTriggered", "createdAt", "endTime", "id", "modelId", "startTime", "status", "userPrinterId") SELECT "autoEjectTriggered", "createdAt", "endTime", "id", "modelId", "startTime", "status", "userPrinterId" FROM "PrintJob";
DROP TABLE "PrintJob";
ALTER TABLE "new_PrintJob" RENAME TO "PrintJob";
CREATE TABLE "new_UserPrinter" (
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
    "printerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserPrinter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserPrinter_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserPrinter" ("apiKey", "createdAt", "currentJobId", "id", "ipAddress", "isAutoEjectCapable", "name", "printerId", "status", "type", "updatedAt", "userId") SELECT "apiKey", "createdAt", "currentJobId", "id", "ipAddress", "isAutoEjectCapable", "name", "printerId", "status", "type", "updatedAt", "userId" FROM "UserPrinter";
DROP TABLE "UserPrinter";
ALTER TABLE "new_UserPrinter" RENAME TO "UserPrinter";
CREATE UNIQUE INDEX "UserPrinter_ipAddress_key" ON "UserPrinter"("ipAddress");
CREATE UNIQUE INDEX "UserPrinter_userId_printerId_key" ON "UserPrinter"("userId", "printerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
