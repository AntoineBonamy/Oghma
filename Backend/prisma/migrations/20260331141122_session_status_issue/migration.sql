/*
  Warnings:

  - You are about to drop the column `session` on the `GameSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameSession" DROP COLUMN "session",
ADD COLUMN     "sessionStatus" "SessionStatus" NOT NULL DEFAULT 'OPEN';
