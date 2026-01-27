-- CreateTable
CREATE TABLE "User"
(
    "id"           TEXT     NOT NULL PRIMARY KEY,
    "username"     TEXT     NOT NULL,
    "passwordHash" TEXT     NOT NULL,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Printer"
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
    "updatedAt"          DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Model"
(
    "id"            TEXT     NOT NULL PRIMARY KEY,
    "name"          TEXT     NOT NULL,
    "filePath"      TEXT     NOT NULL,
    "gcodePath"     TEXT,
    "estimatedTime" INTEGER  NOT NULL DEFAULT 0,
    "filamentGrams" REAL     NOT NULL DEFAULT 0.0,
    "thumbnailUrl"  TEXT,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrintJob"
(
    "id"                 TEXT     NOT NULL PRIMARY KEY,
    "printerId"          TEXT,
    "modelId"            TEXT     NOT NULL,
    "status"             TEXT     NOT NULL DEFAULT 'PENDING',
    "startTime"          DATETIME,
    "endTime"            DATETIME,
    "autoEjectTriggered" BOOLEAN  NOT NULL DEFAULT false,
    "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialStats"
(
    "id"                TEXT NOT NULL PRIMARY KEY,
    "type"              TEXT NOT NULL,
    "costPerGram"       REAL NOT NULL,
    "color"             TEXT NOT NULL,
    "currentStockGrams" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User" ("username");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_ipAddress_key" ON "Printer" ("ipAddress");
