import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { albumInclude, albumsWithPresignedUrls } from "./album";
import { type Prisma } from "@prisma/client";
import { songsWithPresignedUrls } from "./song";
import {
  getPresignedAlbumImageUrl,
  getPresignedArtistImageUrl,
  getPresignedSongUrl,
} from "~/server/blob";

export const artistInclude = {
  albums: true,
  songs: true,
} satisfies Prisma.ArtistInclude;

type ArtistWithoutPresignedUrls = Prisma.ArtistGetPayload<{
  include: typeof artistInclude;
}>;

async function artistWithPresignedUrls(artist: ArtistWithoutPresignedUrls) {
  return {
    ...artist,
    imageUrl: await getPresignedArtistImageUrl(artist.id),
    albums: await Promise.all(
      artist.albums.map(async (album) => ({
        ...album,
        imageUrl: await getPresignedAlbumImageUrl(album.id),
      })),
    ),
    songs: await Promise.all(
      artist.songs.map(async (song) => ({
        ...song,
        url: await getPresignedSongUrl(song.id),
        imageUrl: await getPresignedAlbumImageUrl(song.albumId),
      })),
    ),
  };
}

export async function artistsWithPresignedUrls(
  artists: ArtistWithoutPresignedUrls[],
) {
  return await Promise.all(
    artists.map((artist) => artistWithPresignedUrls(artist)),
  );
}

export type Artist = Awaited<ReturnType<typeof artistWithPresignedUrls>>;

export const artistRouter = createTRPCRouter({
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const artists = await ctx.db.artist.findMany({
      take: 20,
      include: artistInclude,
    });

    return await artistsWithPresignedUrls(artists);
  }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const artists = await ctx.db.artist.findMany({
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
        include: artistInclude,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (artists.length > limit) {
        const nextItem = artists.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: await artistsWithPresignedUrls(artists),
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const artist = await ctx.db.artist.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: artistInclude,
      });

      return await artistWithPresignedUrls(artist);
    }),

  getPopularSongs: publicProcedure
    .input(z.object({ artistId: z.string() }))
    .query(async ({ ctx, input }) => {
      const songs = await ctx.db.song.findMany({
        where: {
          artistId: input.artistId,
        },
        orderBy: {
          releaseDate: "desc",
        },
        include: {
          artist: true,
          album: true,
        },
        take: 5, // Get top 5 songs for now
      });

      return await songsWithPresignedUrls(songs);
    }),

  getAlbumsByType: publicProcedure
    .input(
      z.object({
        artistId: z.string(),
        type: z.enum(["ALBUM", "EP", "SINGLE"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const albums = await ctx.db.album.findMany({
        where: {
          artistId: input.artistId,
          type: input.type,
        },
        orderBy: {
          releaseDate: "desc",
        },
        include: albumInclude,
      });

      return await albumsWithPresignedUrls(albums);
    }),
});
