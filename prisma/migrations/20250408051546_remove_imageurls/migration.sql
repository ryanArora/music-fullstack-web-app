/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "imageUrl";
