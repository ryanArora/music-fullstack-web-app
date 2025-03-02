import { NextResponse } from "next/server";

import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    const playlist = await db.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!playlist) {
      return new NextResponse("Playlist not found", { status: 404 });
    }

    // Restructure the data to match what the player expects
    // Transform PlaylistSong[] to SongWithDetails[]
    const songs = playlist.songs.map((playlistSong) => playlistSong.song);

    // Return the playlist with the restructured songs array
    return NextResponse.json({
      ...playlist,
      songs,
    });
  } catch (error) {
    console.error("[PLAYLIST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
