/*
  Warnings:

  - You are about to drop the column `check_in_status` on the `attendees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendees" DROP COLUMN "check_in_status",
ADD COLUMN     "is_checked_in" BOOLEAN NOT NULL DEFAULT false;
