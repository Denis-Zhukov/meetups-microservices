/*
  Warnings:

  - A unique constraint covering the columns `[userId,meetupId]` on the table `invitees` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invitees_userId_meetupId_key" ON "invitees"("userId", "meetupId");
