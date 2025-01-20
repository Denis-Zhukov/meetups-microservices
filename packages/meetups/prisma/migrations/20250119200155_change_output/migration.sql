/*
  Warnings:

  - You are about to drop the column `creator` on the `meetups` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `invitees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `meetups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitees" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "meetups" DROP COLUMN "creator",
ADD COLUMN     "creator_id" TEXT NOT NULL;
