-- AlterTable
ALTER TABLE "EmailVerificationCode" ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "EmailVerificationCode_userId_idx" ON "EmailVerificationCode"("userId");
