import { readFile, writeFile } from "fs/promises";
import { taskSchema } from "./common";
import { z } from "zod";
import { env } from "~/env";

async function checkPendingTaskStatuses() {
  console.log("Checking pending task statuses");

  let tasks: z.infer<typeof taskSchema>[] | null = null;
  try {
    tasks = z
      .array(taskSchema)
      .parse(JSON.parse(await readFile("./tasks.json", "utf-8")) as unknown);
  } catch (error) {
    tasks = [];
  }

  for (const [index, task] of tasks
    .filter((t) => t.state.state === "pending")
    .entries()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Checking pending task ${index + 1} of ${tasks.length}`);
    const response = await fetch(
      `https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${task.id}`,
      {
        headers: {
          Authorization: `Bearer ${env.SUNOAPI_API_KEY}`,
        },
      },
    );
    const data = (await response.json()) as unknown;
    console.log("got data", data);

    if (
      typeof data !== "object" ||
      data === null ||
      !("data" in data) ||
      typeof data.data !== "object" ||
      data.data === null ||
      !("response" in data.data) ||
      typeof data.data.response !== "object" ||
      data.data.response === null ||
      !("sunoData" in data.data.response) ||
      !Array.isArray(data.data.response.sunoData)
    ) {
      console.log("suno data missing from response", data);
      continue;
    }

    const sunoData = data.data.response.sunoData as unknown[];
    if (
      sunoData.length === 0 ||
      typeof sunoData[0] !== "object" ||
      sunoData[0] === null ||
      !("audioUrl" in sunoData[0]) ||
      typeof sunoData[0].audioUrl !== "string" ||
      !("imageUrl" in sunoData[0]) ||
      typeof sunoData[0].imageUrl !== "string" ||
      !("duration" in sunoData[0]) ||
      typeof sunoData[0].duration !== "number"
    ) {
      console.log("important data missing from suno data", sunoData);
      continue;
    }

    const url = sunoData[0].audioUrl;
    const imageUrl = sunoData[0].imageUrl;
    const duration = sunoData[0].duration;

    console.log("important data", {
      url,
      imageUrl,
      duration,
    });

    try {
      tasks = z
        .array(taskSchema)
        .parse(JSON.parse(await readFile("./tasks.json", "utf-8")) as unknown);
    } catch (error) {
      tasks = [];
    }
    tasks = tasks.filter((t) => t.id !== task.id);
    tasks.push({
      id: task.id,
      songId: task.songId,
      state: {
        state: "success",
        data: { url, imageUrl, duration },
      },
    });

    await writeFile("./tasks.json", JSON.stringify(tasks, null, 2));
  }
}

while (true) {
  await checkPendingTaskStatuses();
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
