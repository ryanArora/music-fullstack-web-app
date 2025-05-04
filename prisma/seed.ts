import { env } from "~/env";
import { blob } from "~/server/blob";
import { db } from "~/server/db";
import { faker } from "@faker-js/faker";

const GENRES = ["Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Classical"];

async function clearDatabase() {
  const tables = await db.$queryRaw<{ table_name: string }[]>`
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
 `;

  console.log("Clearning tables:", tables);

  for (const { table_name } of tables) {
    await db.$executeRawUnsafe(
      `TRUNCATE TABLE "${table_name}" RESTART IDENTITY CASCADE`,
    );
    console.log(`Cleared table: ${table_name}`);
  }

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

  const songIds: string[] = [];
  for (let i = 0; i < 12; i++) {
    const artist = await db.artist.create({
      data: {
        name: toTitleCase(faker.word.words({ count: { min: 1, max: 3 } })),
      },
    });

    for (let j = 0; j < 6; j++) {
      const albumTypes = ["ALBUM", "EP", "SINGLE"] as const;
      const randomType =
        albumTypes[Math.floor(Math.random() * albumTypes.length)]!;

      let songCount: number | undefined = undefined;
      switch (randomType) {
        case "ALBUM":
          songCount = faker.number.int({ min: 8, max: 15 });
          break;
        case "EP":
          songCount = faker.number.int({ min: 4, max: 6 });
          break;
        case "SINGLE":
          songCount = faker.number.int({ min: 1, max: 2 });
          break;
      }

      const releaseDate = faker.date.past();

      // Create album
      const album = await db.album.create({
        data: {
          title: toTitleCase(
            faker.lorem.words(faker.number.int({ min: 1, max: 3 })),
          ),
          releaseDate: releaseDate,
          type: randomType,
          artistId: artist.id,
        },
      });

      const albumGenre = GENRES[Math.floor(Math.random() * GENRES.length)]!;

      // Create songs separately
      for (let k = 0; k < songCount; k++) {
        const durationSeconds = 180; // 3 minutes
        const song = await db.song.create({
          data: {
            title: toTitleCase(
              faker.lorem.words(faker.number.int({ min: 1, max: 3 })),
            ),
            duration: durationSeconds,
            releaseDate: releaseDate,
            artistId: artist.id,
            albumId: album.id,
            genre: albumGenre,
          },
        });
        songIds.push(song.id);
      }
    }
  }

  await db.user.create({
    data: {
      id: "playlist-owner",
      name: "Playlist Owner",
      email: "playlist-owner@example.com",
    },
  });

  for (const genre of GENRES) {
    const playlist = await db.playlist.create({
      data: {
        title: genre,
        isLiked: false,
        isPublic: true,
      },
    });

    for (let i = 0; i < 10; i++) {
      await db.playlistSong.createMany({
        data: [
          {
            playlistId: playlist.id,
            songId: songIds[Math.floor(Math.random() * songIds.length)]!,
            order: i,
          },
        ],
      });
    }
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });

function toTitleCase(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
