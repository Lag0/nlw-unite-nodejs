-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "slug" TEXT,
    "maximum_attendees" INTEGER,
    "price" REAL
);
INSERT INTO "new_events" ("details", "id", "maximum_attendees", "price", "slug", "title") SELECT "details", "id", "maximum_attendees", "price", "slug", "title" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_id_key" ON "events"("id");
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
