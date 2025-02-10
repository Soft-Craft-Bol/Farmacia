-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "documentoUrl" TEXT;

-- CreateTable
CREATE TABLE "ComponenteEquipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponenteEquipo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComponenteEquipo" ADD CONSTRAINT "ComponenteEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
