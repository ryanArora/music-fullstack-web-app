import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { inferAsyncReturnType } from "@trpc/server";
import type { createTRPCContext } from "~/server/api/trpc";
import { getPresignedSongUrl } from "~/server/blob";
import { type Prisma } from "@prisma/client";
import { albumInclude } from "./album";

type Context = inferAsyncReturnType<typeof createTRPCContext>;

// Define the album type with included relations
type AlbumWithRelations = Prisma.AlbumGetPayload<{
  include: typeof albumInclude;
}>;

// Define type for song with presigned URL
type SongWithPresignedUrl = AlbumWithRelations["songs"][number] & {
  url: string;
};

// Define return type with presigned URLs
type AlbumWithPresignedUrls = Omit<AlbumWithRelations, "songs"> & {
  songs: SongWithPresignedUrl[];
};

// Helper function to add presigned URLs to songs in an album
const addPresignedUrlsToAlbum = async (
  album: AlbumWithRelations,
): Promise<AlbumWithPresignedUrls> => {
  const songsWithUrls = await Promise.all(
    album.songs.map(async (song) => ({
      ...song,
      url: await getPresignedSongUrl(song.id),
    })),
  );

  return {
    ...album,
    songs: songsWithUrls,
  };
};

// Helper function to add presigned URL to a song
const addPresignedUrlToSong = async (
  song: Prisma.SongGetPayload<{
    include: {
      artist: true;
      album: {
        include: {
          artist: true;
        };
      };
    };
  }>,
): Promise<SongWithPresignedUrl> => {
  return {
    ...song,
    url: await getPresignedSongUrl(song.id),
  };
};

export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(
      async ({ ctx, input }: { ctx: Context; input: { query: string } }) => {
        const query = input.query.trim();

        if (!query) {
          return {
            artists: [],
            albums: [],
            songs: [],
          };
        }

        const [artists, albums, songs] = await Promise.all([
          // Search artists
          ctx.db.artist.findMany({
            where: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            take: 5,
            orderBy: {
              name: "asc",
            },
          }),

          // Search albums
          ctx.db.album.findMany({
            where: {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  artist: {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            },
            take: 5,
            orderBy: {
              title: "asc",
            },
            include: albumInclude,
          }),

          // Search songs
          ctx.db.song.findMany({
            where: {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  artist: {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            },
            take: 5,
            orderBy: {
              title: "asc",
            },
            include: {
              artist: true,
              album: {
                include: {
                  artist: true,
                },
              },
            },
          }),
        ]);

        const [albumsWithUrls, songsWithUrls] = await Promise.all([
          Promise.all(albums.map(addPresignedUrlsToAlbum)),
          Promise.all(songs.map(addPresignedUrlToSong)),
        ]);

        return {
          artists,
          albums: albumsWithUrls,
          songs: songsWithUrls,
        };
      },
    ),
});
