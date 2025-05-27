-- CreateEnum
CREATE TYPE "EstadoTrabajo" AS ENUM ('Pendiente', 'Aceptado', 'EnProgreso', 'Rechazado', 'Finalizado', 'Cancelado');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');

-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "encargadoNombre" TEXT,
ADD COLUMN     "nombreEquipo" TEXT,
ADD COLUMN     "prioridad" "Prioridad" NOT NULL DEFAULT 'Media';

-- CreateTable
CREATE TABLE "TrabajoAsignacion" (
    "id" SERIAL NOT NULL,
    "trabajoId" INTEGER NOT NULL,
    "tecnicoId" INTEGER,
    "tecnicoNombre" TEXT,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "observaciones" TEXT,

    CONSTRAINT "TrabajoAsignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialTrabajo" (
    "id" SERIAL NOT NULL,
    "trabajoId" INTEGER NOT NULL,
    "estado" "EstadoTrabajo" NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "usuarioNombre" TEXT NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "HistorialTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrabajoAsignacion_trabajoId_tecnicoId_key" ON "TrabajoAsignacion"("trabajoId", "tecnicoId");

-- AddForeignKey
ALTER TABLE "TrabajoAsignacion" ADD CONSTRAINT "TrabajoAsignacion_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialTrabajo" ADD CONSTRAINT "HistorialTrabajo_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
