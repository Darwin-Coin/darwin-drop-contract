/*
  Warnings:

  - Added the required column `maxNumber` to the `AirDropToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AirDropToken" ADD COLUMN     "maxNumber" INTEGER NOT NULL;
