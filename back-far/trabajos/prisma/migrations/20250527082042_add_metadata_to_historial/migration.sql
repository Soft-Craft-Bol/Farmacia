/*
  Warnings:

  - You are about to drop the `ReporteFinalizacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrabajoEquipo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReporteFinalizacion" DROP CONSTRAINT "ReporteFinalizacion_trabajoId_fkey";

-- DropForeignKey
ALTER TABLE "TrabajoEquipo" DROP CONSTRAINT "TrabajoEquipo_trabajoId_fkey";

-- DropTable
DROP TABLE "ReporteFinalizacion";

-- DropTable
DROP TABLE "TrabajoEquipo";
