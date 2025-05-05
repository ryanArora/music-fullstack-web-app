import * as Minio from "minio";
import { env } from "~/env";

export const blob = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_USER,
  secretKey: env.MINIO_PASSWORD,
});

const MINIO_PRIVATE_URL = `${env.MINIO_USE_SSL ? "https" : "http"}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`;

export async function getPresignedSongUrl(songId: string) {
  const url = await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_MUSIC,
    `${songId}.webm`,
    24 * 60 * 60,
  );
  return url.replace(MINIO_PRIVATE_URL, env.NEXT_PUBLIC_MINIO_URL);
}

export async function getPresignedAlbumImageUrl(albumId: string) {
  const url = await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_ALBUM_IMAGES,
    `${albumId}.webp`,
    24 * 60 * 60,
  );
  return url.replace(MINIO_PRIVATE_URL, env.NEXT_PUBLIC_MINIO_URL);
}

export async function getPresignedArtistImageUrl(artistId: string) {
  const url = await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_ARTIST_IMAGES,
    `${artistId}.webp`,
    24 * 60 * 60,
  );
  return url.replace(MINIO_PRIVATE_URL, env.NEXT_PUBLIC_MINIO_URL);
}

export async function getPresignedPlaylistImageUrl(playlistId: string) {
  const url = await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_PLAYLIST_IMAGES,
    `${playlistId}.webp`,
    24 * 60 * 60,
  );
  return url.replace(MINIO_PRIVATE_URL, env.NEXT_PUBLIC_MINIO_URL);
}
