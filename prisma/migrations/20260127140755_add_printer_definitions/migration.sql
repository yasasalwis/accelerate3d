-- CreateTable
CREATE TABLE "PrinterDefinition"
(
    "id"                   TEXT     NOT NULL PRIMARY KEY,
    "make"                 TEXT     NOT NULL,
    "model"                TEXT     NOT NULL,
    "buildVolumeX"         REAL     NOT NULL,
    "buildVolumeY"         REAL     NOT NULL,
    "buildVolumeZ"         REAL     NOT NULL,
    "technology"           TEXT     NOT NULL,
    "maxPowerConsumptionW" INTEGER,
    "priceUsd"             REAL,
    "imageUrl"             TEXT,
    "sourceUrl"            TEXT,
    "features"             TEXT,
    "createdAt"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            DATETIME NOT NULL
);

-- RedefineTables
PRAGMA
defer_foreign_keys=ON;
PRAGMA
foreign_keys=OFF;
CREATE TABLE "new_Printer"
(
    "id"                 TEXT     NOT NULL PRIMARY KEY,
    "name"               TEXT     NOT NULL,
    "ipAddress"          TEXT     NOT NULL,
    "apiKey"             TEXT,
    "status"             TEXT     NOT NULL DEFAULT 'IDLE',
    "type"               TEXT     NOT NULL DEFAULT 'FDM',
    "isAutoEjectCapable" BOOLEAN  NOT NULL DEFAULT false,
    "currentJobId"       TEXT,
    "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          DATETIME NOT NULL,
    "definitionId"       TEXT,
    CONSTRAINT "Printer_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "PrinterDefinition" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Printer" ("apiKey", "createdAt", "currentJobId", "id", "ipAddress", "isAutoEjectCapable", "name",
                           "status", "type", "updatedAt")
SELECT "apiKey",
       "createdAt",
       "currentJobId",
       "id",
       "ipAddress",
       "isAutoEjectCapable",
       "name",
       "status",
       "type",
       "updatedAt"
FROM "Printer";
DROP TABLE "Printer";
ALTER TABLE "new_Printer" RENAME TO "Printer";
CREATE UNIQUE INDEX "Printer_ipAddress_key" ON "Printer" ("ipAddress");
PRAGMA
foreign_keys=ON;
PRAGMA
defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PrinterDefinition_make_model_key" ON "PrinterDefinition" ("make", "model");
