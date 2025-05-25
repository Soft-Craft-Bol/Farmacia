/*
  Warnings:

  - The `encargadoId` column on the `Trabajo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "areaId" TEXT,
ADD COLUMN     "equipoId" INTEGER,
DROP COLUMN "encargadoId",
ADD COLUMN     "encargadoId" INTEGER;
