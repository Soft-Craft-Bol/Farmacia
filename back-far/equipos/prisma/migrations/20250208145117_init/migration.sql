-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "etiquetaActivo" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "tipoMantenimiento" TEXT NOT NULL,
    "fechaCompra" TIMESTAMP(3) NOT NULL,
    "proveedor" TEXT NOT NULL,
    "numeroOrden" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_etiquetaActivo_key" ON "Equipo"("etiquetaActivo");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_numeroSerie_key" ON "Equipo"("numeroSerie");
