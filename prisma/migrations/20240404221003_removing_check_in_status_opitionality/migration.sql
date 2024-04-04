/*
  Warnings:

  - Made the column `check_in_status` on table `attendees` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "attendees" ALTER COLUMN "check_in_status" SET NOT NULL;
