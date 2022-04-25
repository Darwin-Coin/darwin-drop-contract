/*
  Warnings:

  - You are about to drop the column `dropParticipantsId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_dropParticipantsId_fkey";

-- AlterTable
ALTER TABLE "DropParticipants" ADD COLUMN     "participants" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dropParticipantsId";
