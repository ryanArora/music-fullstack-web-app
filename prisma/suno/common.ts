import { z } from "zod";

export const taskSchema = z.object({
  id: z.string().min(1),
  songId: z.string().min(1),
  state: z.discriminatedUnion("state", [
    z.object({
      state: z.literal("pending"),
    }),
    z.object({
      state: z.literal("success"),
      data: z.object({
        url: z.string().url(),
        duration: z.number(),
        imageUrl: z.string().url(),
      }),
    }),
  ]),
});
