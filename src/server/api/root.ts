import { songRouter } from "~/server/api/routers/song";
import { artistRouter } from "~/server/api/routers/artist";
import { albumRouter } from "~/server/api/routers/album";
import { playlistRouter } from "~/server/api/routers/playlist";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  song: songRouter,
  artist: artistRouter,
  album: albumRouter,
  playlist: playlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
