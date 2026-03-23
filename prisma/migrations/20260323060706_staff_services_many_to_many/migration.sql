/*
  Warnings:

  - You are about to drop the column `serviceId` on the `staff` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_StaffServices" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StaffServices_A_fkey" FOREIGN KEY ("A") REFERENCES "service" ("serviceId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StaffServices_B_fkey" FOREIGN KEY ("B") REFERENCES "staff" ("staffId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_service" (
    "serviceId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "category" TEXT
);
INSERT INTO "new_service" ("category", "serviceId", "type") SELECT "category", "serviceId", "type" FROM "service";
DROP TABLE "service";
ALTER TABLE "new_service" RENAME TO "service";
CREATE UNIQUE INDEX "service_type_key" ON "service"("type");
CREATE TABLE "new_staff" (
    "staffId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_staff" ("name", "staffId") SELECT "name", "staffId" FROM "staff";
DROP TABLE "staff";
ALTER TABLE "new_staff" RENAME TO "staff";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_StaffServices_AB_unique" ON "_StaffServices"("A", "B");

-- CreateIndex
CREATE INDEX "_StaffServices_B_index" ON "_StaffServices"("B");
