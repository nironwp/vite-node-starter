-- CreateTable
CREATE TABLE "Entrie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "time" DATETIME NOT NULL
);
