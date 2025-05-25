-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "horasUsoAcumuladas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intervaloMantenimiento" INTEGER NOT NULL DEFAULT 180,
ADD COLUMN     "proximoMantenimiento" TIMESTAMP(3),
ADD COLUMN     "ultimoMantenimiento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "HistorialMantenimiento" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "horasUso" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "tecnicoNombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialMantenimiento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistorialMantenimiento" ADD CONSTRAINT "HistorialMantenimiento_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
