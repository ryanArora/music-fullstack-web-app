import { faker } from "@faker-js/faker";
import { env } from "~/env";
import { readFile, writeFile } from "fs/promises";
import { z } from "zod";
import { taskSchema } from "./common";
import { db } from "~/server/db";

export async function generateSong({
  songId,
  genre,
}: {
  songId: string;
  genre: string;
}) {
  const response = await fetch("https://apibox.erweima.ai/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SUNOAPI_API_KEY}`,
    },
    body: JSON.stringify({
      customMode: true,
      instrumental: true,
      style: genre,
      title: faker.music.songName(),
      model: "V4",
      callBackUrl: "https://api.example.com/callback",
    }),
  });

  const data = (await response.json()) as unknown;
  if (
    typeof data !== "object" ||
    data === null ||
    !("data" in data) ||
    typeof data.data !== "object" ||
    data.data === null ||
    !("taskId" in data.data) ||
    typeof data.data.taskId !== "string"
  ) {
    throw new Error("Invalid response format from API");
  }

  const taskId = data.data.taskId;
  await persistTaskId({ taskId, songId });
}

async function persistTaskId({
  taskId,
  songId,
}: {
  taskId: string;
  songId: string;
}) {
  let taskIds: z.infer<typeof taskSchema>[] | null = null;
  try {
    taskIds = z
      .array(taskSchema)
      .parse(JSON.parse(await readFile("./tasks.json", "utf-8")) as unknown);
  } catch (_error) {
    taskIds = [];
  }
  taskIds.push({ id: taskId, songId: songId, state: { state: "pending" } });

  await writeFile("./tasks.json", JSON.stringify(taskIds, null, 2));
}

const song = await db.song.findFirstOrThrow();
await generateSong({
  genre: song.genre ?? "Pop",
  songId: song.id,
});
