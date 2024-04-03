/*
  Warnings:

  - A unique constraint covering the columns `[ticket_id]` on the table `attendees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attendees" ADD COLUMN "ticket_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "attendees_ticket_id_key" ON "attendees"("ticket_id");
