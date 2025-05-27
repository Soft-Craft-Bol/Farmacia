-- CreateTable
CREATE TABLE "ReporteFinalizacion" (
    "id" SERIAL NOT NULL,
    "trabajoId" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "fechaFinalizacion" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "solucionAplicada" TEXT,
    "materialesUtilizados" TEXT,
    "horasTrabajadas" DOUBLE PRECISION,
    "recomendaciones" TEXT,
    "documentos" TEXT,
    "imagenes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReporteFinalizacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReporteFinalizacion" ADD CONSTRAINT "ReporteFinalizacion_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
