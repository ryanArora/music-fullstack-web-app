import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { spawn } from "child_process";
import { EventEmitter } from "events";

let isScrapingInProgress = false;
const scrapeEmitter = new EventEmitter();

export const scrapeRouter = createTRPCRouter({
  scrapeArtist: publicProcedure
    .input(
      z.object({
        artistName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
            scrapeEmitter.emit("progress", output);
          });

          scrapeProcess.stderr.on("data", (data) => {
            const error = data.toString();
            errorData += error;
            console.error(`Scrape error: ${error}`);
            scrapeEmitter.emit("error", error);
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
});
