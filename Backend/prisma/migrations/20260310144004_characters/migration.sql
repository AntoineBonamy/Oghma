-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_worldId_fkey";

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentCharacterID" TEXT,
ALTER COLUMN "worldId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_parentCharacterID_fkey" FOREIGN KEY ("parentCharacterID") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE SET NULL ON UPDATE CASCADE;
