/*
  Warnings:

  - Added the required column `encargadoId` to the `Trabajo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `Trabajo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "encargadoId" TEXT NOT NULL,
ADD COLUMN     "fechaFin" TIMESTAMP(3),
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL;
