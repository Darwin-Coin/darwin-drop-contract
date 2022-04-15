-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_dropParticipantsId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dropParticipantsId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dropParticipantsId_fkey" FOREIGN KEY ("dropParticipantsId") REFERENCES "DropParticipants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
