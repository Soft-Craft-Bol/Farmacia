-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ImagenEquipo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "file" TEXT,
    "isExisting" BOOLEAN NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagenEquipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoEquipo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT,
    "type" TEXT NOT NULL,
    "isExisting" BOOLEAN NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoEquipo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImagenEquipo" ADD CONSTRAINT "ImagenEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoEquipo" ADD CONSTRAINT "DocumentoEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
