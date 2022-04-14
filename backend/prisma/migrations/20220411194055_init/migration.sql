-- CreateEnum
CREATE TYPE "airDropType" AS ENUM ('LOTTERY', 'USER_LIMITED', 'TOKEN_LIMITED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'CREATOR');

-- CreateTable
CREATE TABLE "AirDropToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "coinName" TEXT NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "chainName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "type" "airDropType" NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "AirDropToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AirDropToken_id_key" ON "AirDropToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- AddForeignKey
ALTER TABLE "AirDropToken" ADD CONSTRAINT "AirDropToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
