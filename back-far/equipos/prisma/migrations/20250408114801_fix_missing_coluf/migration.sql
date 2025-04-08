/*
  Warnings:

  - You are about to drop the column `documentoUrl` on the `Equipo` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `Equipo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Equipo" DROP COLUMN "documentoUrl",
DROP COLUMN "fotoUrl",
ADD COLUMN     "documentoUrl1" TEXT,
ADD COLUMN     "documentoUrl2" TEXT,
ADD COLUMN     "documentoUrl3" TEXT,
ADD COLUMN     "documentoUrl4" TEXT,
ADD COLUMN     "fotoUrl1" TEXT,
ADD COLUMN     "fotoUrl2" TEXT,
ADD COLUMN     "fotoUrl3" TEXT,
ADD COLUMN     "fotoUrl4" TEXT;
