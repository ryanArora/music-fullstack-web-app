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
    const objects = await blob.listObjects(bucket.name);

    for await (const object of objects) {
      await blob.removeObject(bucket.name, object.name);
      console.log(`Removed object ${object.name} from bucket ${bucket.name}`);
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
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
