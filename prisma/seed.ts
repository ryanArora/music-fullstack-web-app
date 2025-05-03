import { env } from "~/env";
import { blob } from "~/server/blob";
import { db } from "~/server/db";

async function clearDatabase() {
  await db.playlistSong.deleteMany();
  await db.playlist.deleteMany();
  await db.song.deleteMany();
  await db.album.deleteMany();
  await db.artist.deleteMany();
  console.log("Database cleared");
}

async function clearBlob() {
  const buckets = await blob.listBuckets();

  for (const bucket of buckets) {
    const objects = blob.listObjects(bucket.name);

    for await (const object of objects) {
      const obj = object as unknown;
      if (
        typeof obj !== "object" ||
        !obj ||
        !("name" in obj) ||
        typeof obj.name !== "string"
      )
        continue;
      await blob.removeObject(bucket.name, obj.name);
      console.log(`Removed object ${obj.name} from bucket ${bucket.name}`);
    }

    await blob.removeBucket(bucket.name);
    console.log(`Removed bucket ${bucket.name}`);
  }
  console.log("Blob cleared");
}

async function main() {
  await clearDatabase();
  await clearBlob();
  await blob.makeBucket(env.MINIO_BUCKET_NAME_MUSIC);
  await blob.makeBucket(env.MINIO_BUCKET_NAME_ALBUM_IMAGES);
  await blob.makeBucket(env.MINIO_BUCKET_NAME_ARTIST_IMAGES);
  await blob.makeBucket(env.MINIO_BUCKET_NAME_PLAYLIST_IMAGES);

  await db.user.create({
    data: {
      id: "tester",
      name: "Tester",
      email: "tester@example.com",
      playlists: {
        create: [
          {
            title: "Liked Songs",
            isLiked: true,
            isPublic: false,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
