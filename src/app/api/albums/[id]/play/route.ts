import { NextResponse } from "next/server";

import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    const album = await db.album.findUnique({
      where: { id },
      include: {
        artist: true,
        songs: {
          include: {
            artist: true,
            album: true,
          },
          orderBy: {
            title: "asc",
          },
        },
      },
    });

    if (!album) {
      return new NextResponse("Album not found", { status: 404 });
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error("[ALBUM_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
