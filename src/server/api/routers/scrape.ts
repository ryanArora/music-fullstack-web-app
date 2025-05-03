/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { spawn } from "child_process";
import EventEmitter from "node:events";
import { on } from "node:events";

let isScrapingInProgress = false;

type EventMap<T> = Record<keyof T, any[]>;
class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter {
  toIterable<TEventName extends keyof T & string>(
    eventName: TEventName,
    opts?: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterable<T[TEventName]> {
    return on(this as any, eventName, opts) as any;
  }
}

interface ScrapeEvents {
  progress: [data: string];
  error: [error: string];
}

const ee = new IterableEventEmitter<ScrapeEvents>();

export const scrapeRouter = createTRPCRouter({
  scrapeArtist: publicProcedure
    .input(
      z.object({
        artistName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { artistName } = input;
      if (isScrapingInProgress) {
        return { success: false, message: "Scraping is already in progress" };
      }

      isScrapingInProgress = true;
      let outputData = "";
      let errorData = "";

      try {
        const scrapeProcess = spawn("tsx", ["prisma/scrape.ts", artistName]);

        const processPromise = new Promise<void>((resolve, reject) => {
          scrapeProcess.stdout.on("data", (data) => {
            const output = data.toString();
            outputData += output;
            console.log(`Scrape output: ${output}`);
            ee.emit("progress", output);
          });

          scrapeProcess.stderr.on("data", (data) => {
            const error = data.toString();
            errorData += error;
            console.error(`Scrape error: ${error}`);
            ee.emit("error", error);
          });

          scrapeProcess.on("close", (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Process exited with code ${code}`));
            }
          });

          scrapeProcess.on("error", (err) => {
            reject(err);
          });
        });

        await processPromise;

        if (errorData) {
          console.error("Scraping error:", errorData);
          return {
            success: false,
            message: `Error during scraping: ${errorData}`,
          };
        }

        return {
          success: true,
          message: "Scraping completed successfully",
          output: outputData,
        };
      } catch (error) {
        console.error("Failed to execute scrape script:", error);
        return {
          success: false,
          message: `Failed to execute scrape script: ${error instanceof Error ? error.message : String(error)}`,
          output: outputData,
        };
      } finally {
        isScrapingInProgress = false;
      }
    }),

  progress: publicProcedure.subscription(async function* ({ signal }) {
    for await (const [data] of ee.toIterable("progress", { signal })) {
      yield data as string;
    }
  }),

  error: publicProcedure.subscription(async function* ({ signal }) {
    for await (const [data] of ee.toIterable("error", { signal })) {
      yield data as string;
    }
  }),
});
