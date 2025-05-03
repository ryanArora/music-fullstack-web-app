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

export async function getPresignedAlbumImageUrl(imageId: string) {
  return await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_ALBUM_IMAGES,
    `${imageId}.webp`,
    24 * 60 * 60,
  );
}

export async function getPresignedArtistImageUrl(artistId: string) {
  return await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_ARTIST_IMAGES,
    `${artistId}.webp`,
    24 * 60 * 60,
  );
}

export async function getPresignedPlaylistImageUrl(playlistId: string) {
  return await blob.presignedGetObject(
    env.MINIO_BUCKET_NAME_PLAYLIST_IMAGES,
    `${playlistId}.webp`,
    24 * 60 * 60,
  );
}
