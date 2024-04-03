/*
  Warnings:

  - Made the column `ticket_id` on table `attendees` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attendees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticket_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_in_at" DATETIME,
    "event_id" TEXT NOT NULL,
    CONSTRAINT "attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_attendees" ("checked_in_at", "created_at", "email", "event_id", "id", "name", "ticket_id") SELECT "checked_in_at", "created_at", "email", "event_id", "id", "name", "ticket_id" FROM "attendees";
DROP TABLE "attendees";
ALTER TABLE "new_attendees" RENAME TO "attendees";
CREATE UNIQUE INDEX "attendees_id_key" ON "attendees"("id");
CREATE UNIQUE INDEX "attendees_ticket_id_key" ON "attendees"("ticket_id");
CREATE UNIQUE INDEX "attendees_event_id_email_key" ON "attendees"("event_id", "email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
