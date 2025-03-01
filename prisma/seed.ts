import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();

  // Create artists
  const artist1 = await prisma.artist.create({
    data: {
      name: "The Weekend",
      imageUrl:
        "https://i.scdn.co/image/ab6761610000e5eb92202c4d41ebd9bf6be01e3c",
    },
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: "Dua Lipa",
      imageUrl:
        "https://i.scdn.co/image/ab6761610000e5ebf9bafe9abe2c8d509c8a7849",
    },
  });

  const artist3 = await prisma.artist.create({
    data: {
      name: "Billie Eilish",
      imageUrl:
        "https://i.scdn.co/image/ab6761610000e5ebc5ceb05f152103b2b70d3b06",
    },
  });

  // Create albums
  const album1 = await prisma.album.create({
    data: {
      title: "After Hours",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
      artistId: artist1.id,
      releaseDate: new Date("2020-03-20"),
    },
  });

  const album2 = await prisma.album.create({
    data: {
      title: "Future Nostalgia",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2734e0362c225863f6ae9c4f5c7",
      artistId: artist2.id,
      releaseDate: new Date("2020-03-27"),
    },
  });

  const album3 = await prisma.album.create({
    data: {
      title: "Happier Than Ever",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e",
      artistId: artist3.id,
      releaseDate: new Date("2021-07-30"),
    },
  });

  // Create songs
  const song1 = await prisma.song.create({
    data: {
      title: "Blinding Lights",
      duration: 200,
      url: "/songs/blinding-lights.mp3",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
      artistId: artist1.id,
      albumId: album1.id,
      genre: "Pop",
      releaseDate: new Date("2020-03-20"),
    },
  });

  const song2 = await prisma.song.create({
    data: {
      title: "Save Your Tears",
      duration: 215,
      url: "/songs/save-your-tears.mp3",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
      artistId: artist1.id,
      albumId: album1.id,
      genre: "Pop",
      releaseDate: new Date("2020-03-20"),
    },
  });

  const song3 = await prisma.song.create({
    data: {
      title: "Don't Start Now",
      duration: 183,
      url: "/songs/dont-start-now.mp3",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2734e0362c225863f6ae9c4f5c7",
      artistId: artist2.id,
      albumId: album2.id,
      genre: "Pop",
      releaseDate: new Date("2019-11-01"),
    },
  });

  const song4 = await prisma.song.create({
    data: {
      title: "Levitating",
      duration: 203,
      url: "/songs/levitating.mp3",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2734e0362c225863f6ae9c4f5c7",
      artistId: artist2.id,
      albumId: album2.id,
      genre: "Pop",
      releaseDate: new Date("2020-10-01"),
    },
  });

  const song5 = await prisma.song.create({
    data: {
      title: "Happier Than Ever",
      duration: 298,
      url: "/songs/happier-than-ever.mp3",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e",
      artistId: artist3.id,
      albumId: album3.id,
      genre: "Alternative",
      releaseDate: new Date("2021-07-30"),
    },
  });

  const song6 = await prisma.song.create({
    data: {
      title: "Therefore I Am",
      duration: 173,
      url: "/songs/therefore-i-am.mp3",
      imageUrl:
        "https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e",
      artistId: artist3.id,
      albumId: album3.id,
      genre: "Alternative",
      releaseDate: new Date("2020-11-12"),
    },
  });

  // Create playlists
  const playlist1 = await prisma.playlist.create({
    data: {
      title: "Top Hits",
      imageUrl:
        "https://i.scdn.co/image/ab67706f00000002eb12c082e4da45a4b248c9b9",
    },
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      title: "Chill Vibes",
      imageUrl:
        "https://i.scdn.co/image/ab67706f00000002b0fe40a6e1692822f5a9d8f1",
    },
  });

  // Add songs to playlists
  await prisma.playlistSong.create({
    data: {
      playlistId: playlist1.id,
      songId: song1.id,
      order: 1,
    },
  });

  await prisma.playlistSong.create({
    data: {
      playlistId: playlist1.id,
      songId: song3.id,
      order: 2,
    },
  });

  await prisma.playlistSong.create({
    data: {
      playlistId: playlist1.id,
      songId: song5.id,
      order: 3,
    },
  });

  await prisma.playlistSong.create({
    data: {
      playlistId: playlist2.id,
      songId: song2.id,
      order: 1,
    },
  });

  await prisma.playlistSong.create({
    data: {
      playlistId: playlist2.id,
      songId: song4.id,
      order: 2,
    },
  });

  await prisma.playlistSong.create({
    data: {
      playlistId: playlist2.id,
      songId: song6.id,
      order: 3,
    },
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
