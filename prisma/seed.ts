import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configuration for the amount of data to generate
const ARTIST_COUNT = 50;
const ALBUMS_PER_ARTIST_MIN = 1;
const ALBUMS_PER_ARTIST_MAX = 5;
const SONGS_PER_ALBUM_MIN = 6;
const SONGS_PER_ALBUM_MAX = 12;
const PLAYLIST_COUNT = 30;
const SONGS_PER_PLAYLIST_MIN = 8;
const SONGS_PER_PLAYLIST_MAX = 25;

// Helper function to get a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get a random subset of items from an array
function getRandomSubset<T>(array: T[], minSize: number, maxSize: number): T[] {
  const size = getRandomInt(
    Math.min(minSize, array.length),
    Math.min(maxSize, array.length),
  );
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

// Helper to generate realistic music genres
function getRandomGenre(): string {
  const genres = [
    "Pop",
    "Rock",
    "Hip Hop",
    "R&B",
    "Country",
    "Electronic",
    "Jazz",
    "Classical",
    "Reggae",
    "Folk",
    "Metal",
    "Blues",
    "Latin",
    "Punk",
    "Soul",
    "Funk",
    "Disco",
    "Alternative",
    "Indie",
    "K-pop",
  ];
  return faker.helpers.arrayElement(genres);
}

async function main() {
  console.log("Starting database seeding...");

  // Clear existing data
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();

  console.log("Previous data cleared. Generating new data...");

  // Generate artists data using map
  console.log(`Preparing ${ARTIST_COUNT} artists...`);
  const artistsData = Array.from({ length: ARTIST_COUNT }).map(() => ({
    name: faker.person.fullName(),
    imageUrl: faker.image.urlLoremFlickr({ height: 400, width: 400 }),
  }));

  // Create artists in a batch
  const artists = await prisma.artist
    .createMany({
      data: artistsData,
    })
    .then(async () => {
      // Fetch the created artists to get their IDs
      return await prisma.artist.findMany();
    });

  console.log(`Generated ${artists.length} artists.`);

  // Generate album data using flatMap
  console.log("Preparing albums for each artist...");
  const albumsData = artists.flatMap((artist) => {
    const albumCount = getRandomInt(
      ALBUMS_PER_ARTIST_MIN,
      ALBUMS_PER_ARTIST_MAX,
    );

    return Array.from({ length: albumCount }).map(() => {
      const releaseDate = faker.date.between({
        from: new Date(1990, 0, 1),
        to: new Date(),
      });

      return {
        title: faker.music.songName(),
        imageUrl: faker.image.urlLoremFlickr({ height: 400, width: 400 }),
        artistId: artist.id,
        releaseDate: releaseDate,
      };
    });
  });

  // Create albums in a batch
  await prisma.album.createMany({
    data: albumsData,
  });

  // Fetch the created albums to get their IDs
  const albums = await prisma.album.findMany();
  console.log(`Generated ${albums.length} albums.`);

  // Generate songs data using flatMap
  console.log("Preparing songs for each album...");
  const songsData = albums.flatMap((album) => {
    const songCount = getRandomInt(SONGS_PER_ALBUM_MIN, SONGS_PER_ALBUM_MAX);
    const artist = artists.find((a) => a.id === album.artistId);

    if (!artist) return [];

    return Array.from({ length: songCount }).map(() => ({
      title: faker.music.songName(),
      duration: getRandomInt(120, 420), // 2-7 minutes in seconds
      url: `/songs/${faker.string.uuid()}.mp3`,
      imageUrl: album.imageUrl, // Use album cover
      artistId: artist.id,
      albumId: album.id,
      genre: getRandomGenre(),
      releaseDate: album.releaseDate,
    }));
  });

  // Create songs in a batch
  await prisma.song.createMany({
    data: songsData,
  });

  // Fetch the created songs to get their IDs
  const songs = await prisma.song.findMany();
  console.log(`Generated ${songs.length} songs.`);

  // Generate playlists data using map
  console.log(`Preparing ${PLAYLIST_COUNT} playlists...`);
  const playlistsData = Array.from({ length: PLAYLIST_COUNT }).map(() => {
    const playlistName = faker.helpers.arrayElement([
      `${faker.music.genre()} Mix`,
      `${faker.word.adjective()} Vibes`,
      faker.word.adjective() + " " + faker.word.noun(),
      faker.person.firstName() + "'s Playlist",
      faker.company.buzzPhrase(),
    ]);

    return {
      title: playlistName,
      imageUrl: faker.image.urlLoremFlickr({ height: 400, width: 400 }),
    };
  });

  // Create playlists in a batch
  await prisma.playlist.createMany({
    data: playlistsData,
  });

  // Fetch the created playlists to get their IDs
  const playlists = await prisma.playlist.findMany();
  console.log(`Generated ${playlists.length} playlists.`);

  // Generate playlist songs data using flatMap
  console.log("Adding songs to playlists...");
  const playlistSongsData = playlists.flatMap((playlist) => {
    const playlistSongs = getRandomSubset(
      songs,
      SONGS_PER_PLAYLIST_MIN,
      SONGS_PER_PLAYLIST_MAX,
    );

    return playlistSongs.map((song, index) => ({
      playlistId: playlist.id,
      songId: song.id,
      order: index + 1,
    }));
  });

  // Create playlist songs in a batch
  await prisma.playlistSong.createMany({
    data: playlistSongsData,
  });

  console.log("Database seeded successfully!");
  console.log(`Generated ${artists.length} artists`);
  console.log(`Generated ${albums.length} albums`);
  console.log(`Generated ${songs.length} songs`);
  console.log(`Generated ${playlists.length} playlists`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
