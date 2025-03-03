import * as Minio from "minio";
import { env } from "~/env";

const MINIO_BUCKET_MUSIC = "music";

export const minio = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_USER,
  secretKey: env.MINIO_PASSWORD,
});

export async function getPresignedSongUrl(songId: string) {
  return await minio.presignedGetObject(
    MINIO_BUCKET_MUSIC,
    `${songId}.webm`,
    24 * 60 * 60,
  );
}
