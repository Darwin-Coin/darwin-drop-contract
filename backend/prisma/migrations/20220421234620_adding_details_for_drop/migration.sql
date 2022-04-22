-- CreateTable
CREATE TABLE "DropDetails" (
    "id" SERIAL NOT NULL,
    "dropId" INTEGER NOT NULL,
    "website" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "socials" TEXT[],
    "description" TEXT NOT NULL,
    "steps" TEXT NOT NULL,

    CONSTRAINT "DropDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DropDetails_dropId_key" ON "DropDetails"("dropId");

-- AddForeignKey
ALTER TABLE "DropDetails" ADD CONSTRAINT "DropDetails_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "AirDropToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
