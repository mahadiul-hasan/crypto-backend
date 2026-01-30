/*
  Warnings:

  - The primary key for the `CourseTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CourseTag` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `CourseTag` table. All the data in the column will be lost.
  - Added the required column `tagId` to the `CourseTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CourseTag_tag_idx";

-- AlterTable
ALTER TABLE "CourseTag" DROP CONSTRAINT "CourseTag_pkey",
DROP COLUMN "id",
DROP COLUMN "tag",
ADD COLUMN     "tagId" TEXT NOT NULL,
ADD CONSTRAINT "CourseTag_pkey" PRIMARY KEY ("courseId", "tagId");

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "CourseTag_tagId_idx" ON "CourseTag"("tagId");

-- AddForeignKey
ALTER TABLE "CourseTag" ADD CONSTRAINT "CourseTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
