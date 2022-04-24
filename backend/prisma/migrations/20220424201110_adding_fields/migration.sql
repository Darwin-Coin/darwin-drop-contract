-- DropForeignKey
ALTER TABLE "AirDropToken" DROP CONSTRAINT "AirDropToken_userId_fkey";

-- AlterTable
ALTER TABLE "AirDropToken" ADD COLUMN     "chainId" TEXT,
ADD COLUMN     "ownerWallet" TEXT;

-- AddForeignKey
ALTER TABLE "AirDropToken" ADD CONSTRAINT "AirDropToken_ownerWallet_fkey" FOREIGN KEY ("ownerWallet") REFERENCES "User"("wallet") ON DELETE SET NULL ON UPDATE CASCADE;
