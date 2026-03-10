-- DropIndex
DROP INDEX "Character_userId_worldId_key";

-- CreateIndex
CREATE UNIQUE INDEX unique_character_per_world
ON "Character" ("userId", "worldId")
WHERE "deletedAt" IS NULL AND "worldId" IS NOT NULL;

-- CreateIndex
CREATE INDEX idx_character_world
ON "Character" ("worldId")
WHERE "deletedAt" IS NULL;