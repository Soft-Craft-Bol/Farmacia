/*
  Warnings:

  - Added the required column `adminId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaFin` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "adminId" TEXT NOT NULL,
ADD COLUMN     "fechaFin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "JobUsuario" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobUsuario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobUsuario" ADD CONSTRAINT "JobUsuario_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
