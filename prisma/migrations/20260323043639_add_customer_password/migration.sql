-- CreateTable
CREATE TABLE "admin" (
    "adminId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "customer" (
    "custId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "appointment" (
    "appId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "custId" INTEGER NOT NULL,
    "service" TEXT NOT NULL,
    "staff" TEXT,
    "appDate" DATETIME NOT NULL,
    "appTime" TEXT NOT NULL,
    "amount" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    CONSTRAINT "appointment_custId_fkey" FOREIGN KEY ("custId") REFERENCES "customer" ("custId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service" (
    "serviceId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "staff" (
    "staffId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    CONSTRAINT "staff_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service" ("serviceId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment" (
    "payId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "custId" INTEGER NOT NULL,
    "appId" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    CONSTRAINT "payment_custId_fkey" FOREIGN KEY ("custId") REFERENCES "customer" ("custId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payment_appId_fkey" FOREIGN KEY ("appId") REFERENCES "appointment" ("appId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_phoneNo_key" ON "customer"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "customer_emailId_key" ON "customer"("emailId");

-- CreateIndex
CREATE INDEX "appointment_custId_idx" ON "appointment"("custId");

-- CreateIndex
CREATE INDEX "appointment_appDate_idx" ON "appointment"("appDate");

-- CreateIndex
CREATE INDEX "staff_serviceId_idx" ON "staff"("serviceId");

-- CreateIndex
CREATE INDEX "payment_custId_idx" ON "payment"("custId");

-- CreateIndex
CREATE INDEX "payment_appId_idx" ON "payment"("appId");
