-- AlterTable
ALTER TABLE "meetups" ADD COLUMN     "location" geography;

-- CreateIndex
CREATE INDEX "location_idx" ON "meetups" USING GIST ("location");
