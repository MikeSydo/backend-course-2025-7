-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" BYTEA,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);
