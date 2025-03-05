import * as Minio from "minio";
import { env } from "~/env";

export const blob = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_USER,
  secretKey: env.MINIO_PASSWORD,
});

export async function getPresignedSongUrl(songId: string) {
  return await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_MUSIC,
    `${songId}.webm`,
    24 * 60 * 60,
  );
}
