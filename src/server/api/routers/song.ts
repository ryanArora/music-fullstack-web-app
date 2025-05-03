import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getPresignedAlbumImageUrl,
  getPresignedArtistImageUrl,
  getPresignedSongUrl,
} from "~/server/blob";
import { type Prisma } from "@prisma/client";

export const songInclude = {
  album: true,
  artist: true,
} satisfies Prisma.SongInclude;

export type SongWithoutPresignedUrls = Prisma.SongGetPayload<{
  include: typeof songInclude;
}>;

export async function songWithPresignedUrls(song: SongWithoutPresignedUrls) {
  const [url, albumImageUrl, artistImageUrl] = await Promise.all([
    getPresignedSongUrl(song.id),
    getPresignedAlbumImageUrl(song.album.id),
    getPresignedArtistImageUrl(song.artist.id),
  ]);

  return {
    ...song,
    url,
    imageUrl: albumImageUrl,
    album: {
      ...song.album,
      imageUrl: albumImageUrl,
    },
    artist: {
      ...song.artist,
      imageUrl: artistImageUrl,
    },
  };
}

export async function songsWithPresignedUrls(
  songs: SongWithoutPresignedUrls[],
) {
  return await Promise.all(songs.map((song) => songWithPresignedUrls(song)));
}

export type Song = Awaited<ReturnType<typeof songWithPresignedUrls>>;

export const songRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).nullish(),
          cursor: z.string().nullish(),
        })
        .nullish(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const songs = await ctx.db.song.findMany({
        include: {
          artist: true,
          album: true,
        },
        orderBy: {
          id: "asc",
        },
        take: limit + 1,
        ...(cursor
          ? {
              cursor: {
                id: cursor,
              },
              skip: 1, // Skip the cursor
            }
          : {}),
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (songs.length > limit) {
        const nextItem = songs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: await songsWithPresignedUrls(songs),
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const song = await ctx.db.song.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          artist: true,
          album: true,
        },
      });

      return await songWithPresignedUrls(song);
    }),

  getByArtistId: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(async ({ ctx, input }) => {
      const songs = await ctx.db.song.findMany({
        where: {
          artistId: input.artistId,
        },
        include: {
          artist: true,
          album: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      return await songsWithPresignedUrls(songs);
    }),

  getByAlbumId: publicProcedure
    .input(z.object({ albumId: z.string() }))
    .query(async ({ ctx, input }) => {
      const songs = await ctx.db.song.findMany({
        where: {
          albumId: input.albumId,
        },
        include: {
          artist: true,
          album: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      return await songsWithPresignedUrls(songs);
    }),
});
