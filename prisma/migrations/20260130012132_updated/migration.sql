/*
  Warnings:

  - A unique constraint covering the columns `[userId,dedupeKey]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CryptoWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CryptoWallet" DROP CONSTRAINT "CryptoWallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CryptoWallet" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "networkTag" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB,
ADD COLUMN     "dedupeKey" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "CryptoWallet_userId_chain_idx" ON "CryptoWallet"("userId", "chain");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_phone_key" ON "Profile"("phone");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWallet" ADD CONSTRAINT "CryptoWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
