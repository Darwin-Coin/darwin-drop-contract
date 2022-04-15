/*
  Warnings:

  - Made the column `userId` on table `AirDropToken` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `dropParticipantsId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AirDropToken" DROP CONSTRAINT "AirDropToken_userId_fkey";

-- AlterTable
ALTER TABLE "AirDropToken" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dropParticipantsId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PasswordProtected" (
    "id" SERIAL NOT NULL,
    "passwords" TEXT[],
    "dropId" INTEGER NOT NULL,

    CONSTRAINT "PasswordProtected_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropParticipants" (
    "id" SERIAL NOT NULL,
    "dropId" INTEGER NOT NULL,

    CONSTRAINT "DropParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordProtected_dropId_key" ON "PasswordProtected"("dropId");

-- CreateIndex
CREATE UNIQUE INDEX "DropParticipants_dropId_key" ON "DropParticipants"("dropId");

-- AddForeignKey
ALTER TABLE "AirDropToken" ADD CONSTRAINT "AirDropToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dropParticipantsId_fkey" FOREIGN KEY ("dropParticipantsId") REFERENCES "DropParticipants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordProtected" ADD CONSTRAINT "PasswordProtected_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "AirDropToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropParticipants" ADD CONSTRAINT "DropParticipants_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "AirDropToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
