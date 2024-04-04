/*
  Warnings:

  - You are about to drop the `check_ins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "check_ins" DROP CONSTRAINT "check_ins_ticket_id_fkey";

-- AlterTable
ALTER TABLE "attendees" ADD COLUMN     "check_in_date" TIMESTAMP(3),
ADD COLUMN     "check_in_status" BOOLEAN DEFAULT false;

-- DropTable
DROP TABLE "check_ins";
