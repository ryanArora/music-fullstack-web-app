import puppeteer, { type Browser } from "puppeteer";
import inquirer from "inquirer";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { blob } from "~/server/blob";
import { env } from "~/env";
import sharp from "sharp";

const prisma = new PrismaClient();
const YOUTUBE_MUSIC_BASE_URL = "https://music.youtube.com";
const YOUTUBE_BASE_URL = "https://www.youtube.com";

export async function getArtistUrl(browser: Browser, artistName: string) {
  const page = await browser.newPage();
  await page.goto(`${YOUTUBE_MUSIC_BASE_URL}/search?q=${artistName}`);

  const selector =
    "html.inactive-player.no-focus-outline body ytmusic-app ytmusic-app-layout#layout.style-scope.ytmusic-app div#content.style-scope.ytmusic-app ytmusic-search-page#search-page.style-scope.ytmusic-app ytmusic-tabbed-search-results-renderer.style-scope.ytmusic-search-page div.content.style-scope.ytmusic-tabbed-search-results-renderer ytmusic-section-list-renderer.style-scope.ytmusic-tabbed-search-results-renderer div#contents.style-scope.ytmusic-section-list-renderer ytmusic-card-shelf-renderer.style-scope.ytmusic-section-list-renderer div.card-container.style-scope.ytmusic-card-shelf-renderer div.card-content-container.style-scope.ytmusic-card-shelf-renderer div.main-card-container.style-scope.ytmusic-card-shelf-renderer div.main-card-content-container.style-scope.ytmusic-card-shelf-renderer div.details-container.style-scope.ytmusic-card-shelf-renderer div.metadata-container.style-scope.ytmusic-card-shelf-renderer yt-formatted-string.title.style-scope.ytmusic-card-shelf-renderer a.yt-simple-endpoint.style-scope.yt-formatted-string";

  await page.waitForSelector(selector);
  const artistPageLink = await page.$(selector);
  if (!artistPageLink) throw new Error("Artist page link not found");

  const artistPageUrl = await page.evaluate(
    (el) => el.getAttribute("href"),
    artistPageLink,
  );
  if (!artistPageUrl) throw new Error("Artist page URL attribute not found");
  if (!artistPageUrl.startsWith("channel/"))
    throw new Error("Invalid artist page URL format");

  await page.close();
  return {
    url: `${YOUTUBE_MUSIC_BASE_URL}/${artistPageUrl}`,
  };
}

export async function getArtistInfo(browser: Browser, artistPageUrl: string) {
  const page = await browser.newPage();
  await page.goto(artistPageUrl);

  const selectorName = "h1.style-scope > yt-formatted-string:nth-child(1)";
  let name: string;
  try {
    await page.waitForSelector(selectorName, { timeout: 1000 });
    const nameText = await page.$eval(selectorName, (el) => el.textContent);
    if (!nameText) throw new Error("Artist name not found");
    name = nameText;
  } catch (_) {
    await page.close();
    throw new Error("Failed to extract artist name");
  }

  const selectorDescription =
    ".description-container > yt-formatted-string:nth-child(1)";
  let description: string | null = null;
  try {
    await page.waitForSelector(selectorDescription, { timeout: 1000 });
    description = await page.$eval(selectorDescription, (el) => el.textContent);
  } catch (_) {
    // Description can be null, so we don't throw here
  }
  const selectorAlbumsUrls =
    "ytmusic-carousel-shelf-renderer.style-scope:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ytmusic-carousel-shelf-basic-header-renderer:nth-child(1) > h2:nth-child(2) > div:nth-child(2) > yt-formatted-string:nth-child(1) > a:nth-child(1)";
  let albumsUrl: string | null = null;
  try {
    await page.waitForSelector(selectorAlbumsUrls, { timeout: 1000 });
    const albumsLink = await page.$(selectorAlbumsUrls);
    albumsUrl = await page.evaluate(
      (el) => el!.getAttribute("href"),
      albumsLink,
    );
  } catch (_) {}

  const selectorBannerImg =
    "html.no-focus-outline body ytmusic-app ytmusic-app-layout#layout.style-scope.ytmusic-app div#content.style-scope.ytmusic-app ytmusic-browse-response#browse-page.style-scope.ytmusic-app div.background-gradient.style-scope.ytmusic-browse-response div#header.style-scope.ytmusic-browse-response ytmusic-immersive-header-renderer.style-scope.ytmusic-browse-response ytmusic-fullbleed-thumbnail-renderer.image.style-scope.ytmusic-immersive-header-renderer picture.style-scope.ytmusic-fullbleed-thumbnail-renderer img.image.style-scope.ytmusic-fullbleed-thumbnail-renderer";
  let imageUrl: string | null = null;
  try {
    await page.waitForSelector(selectorBannerImg, { timeout: 1000 });
    imageUrl = await page.$eval(selectorBannerImg, (el) =>
      el.getAttribute("src"),
    );
  } catch (_) {}

  await page.close();

  return {
    name,
    description,
    albumsUrl: albumsUrl ? `${YOUTUBE_MUSIC_BASE_URL}/${albumsUrl}` : null,
    imageUrl: imageUrl ?? "/images/default-artist.jpg",
  };
}

async function getAlbumUrls(browser: Browser, albumsUrl: string) {
  const page = await browser.newPage();
  await page.goto(albumsUrl);

  const selector =
    "#items > ytmusic-two-row-item-renderer > div.details.style-scope.ytmusic-two-row-item-renderer > div > yt-formatted-string > a";
  await page.waitForSelector(selector);
  const albumLinks = await page.$$(selector);
  if (!albumLinks || albumLinks.length === 0) {
    await page.close();
    throw new Error("No album links found");
  }

  const albumUrls = await Promise.all(
    albumLinks.map(async (albumLink) => {
      const albumUrl = await page.evaluate(
        (el) => el.getAttribute("href"),
        albumLink,
      );
      return albumUrl;
    }),
  );

  await page.close();

  const validUrls = albumUrls.filter((url) => url !== null);
  if (validUrls.length === 0) {
    throw new Error("No valid album URLs found");
  }

  return validUrls.map((url) => `${YOUTUBE_MUSIC_BASE_URL}/${url}`);
}

async function getAlbumUrlsOther(browser: Browser, artistUrl: string) {
  const page = await browser.newPage();
  await page.goto(artistUrl);

  const selector =
    "ytmusic-carousel-shelf-renderer.style-scope:nth-child(2) > div:nth-child(1) > ytmusic-carousel:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > ytmusic-two-row-item-renderer > div:nth-child(4) > div:nth-child(1) > yt-formatted-string:nth-child(2) > a:nth-child(1)";
  await page.waitForSelector(selector, { timeout: 1000 });
  const albumLinks = await page.$$(selector);
  if (!albumLinks || albumLinks.length === 0) {
    await page.close();
    throw new Error("No album links found");
  }

  return (
    await Promise.all(
      albumLinks.map(async (albumLink) => {
        const albumUrl = await page.evaluate(
          (el) => el.getAttribute("href"),
          albumLink,
        );
        return albumUrl;
      }),
    )
  )
    .filter((url) => url !== null)
    .map((url) => `${YOUTUBE_MUSIC_BASE_URL}/${url}`);
}
async function getAlbumInfo(browser: Browser, albumUrl: string) {
  const page = await browser.newPage();
  await page.goto(albumUrl);

  const titleSelector = "h1.style-scope > yt-formatted-string:nth-child(1)";
  await page.waitForSelector(titleSelector);
  const title = await page.$eval(titleSelector, (el) => el.textContent);
  if (!title) {
    await page.close();
    throw new Error("Album title not found");
  }

  const descriptionSelector = "yt-formatted-string.description";
  let description: string | null = null;
  try {
    await page.waitForSelector(descriptionSelector, { timeout: 1000 });
    description = await page.$eval(descriptionSelector, (el) => el.textContent);
  } catch (_) {
    // Description can be null, so we don't throw here
  }

  const albumTypeSelector =
    "yt-formatted-string.ytmusic-responsive-header-renderer:nth-child(2) > span:nth-child(1)";
  let albumType: "ALBUM" | "EP" | "SINGLE" = "ALBUM"; // Default value
  try {
    await page.waitForSelector(albumTypeSelector, { timeout: 1000 });
    const albumTypeRaw = await page.$eval(
      albumTypeSelector,
      (el) => el.textContent,
    );
    if (albumTypeRaw) {
      switch (albumTypeRaw) {
        case "Album":
          albumType = "ALBUM";
          break;
        case "EP":
          albumType = "EP";
          break;
        case "Single":
          albumType = "SINGLE";
          break;
        default:
          albumType = "ALBUM";
      }
    }
  } catch (_) {
    // Use default album type if not found
  }

  const imageSelector =
    "ytmusic-thumbnail-renderer.thumbnail > yt-img-shadow:nth-child(1) > img:nth-child(1)";
  await page.waitForSelector(imageSelector);
  const imageUrl = await page.$eval(imageSelector, (el) => el.src);
  if (!imageUrl) {
    await page.close();
    throw new Error("Album image not found");
  }

  const songsSelector =
    "ytmusic-responsive-list-item-renderer.style-scope > div:nth-child(5) > div:nth-child(1) > yt-formatted-string:nth-child(1) > a:nth-child(1)";
  await page.waitForSelector(songsSelector);
  const songElements = await page.$$(songsSelector);
  if (!songElements || songElements.length === 0) {
    await page.close();
    throw new Error("No songs found for album");
  }

  const songInfo = (
    (
      await Promise.all(
        songElements.map(async (song) => {
          const songData = await page.evaluate(
            (el) => ({
              title: el.textContent,
              url: el.getAttribute("href"),
            }),
            song,
          );
          return songData;
        }),
      )
    ).filter((song) => song.url !== null && song.title !== null) as {
      title: string;
      url: string;
    }[]
  )
    .map((song) => {
      const url = new URL(`${YOUTUBE_MUSIC_BASE_URL}/${song.url}`);
      const videoId = url.searchParams.get("v");
      if (!videoId) return null;

      return {
        ...song,
        videoId,
        url: `${YOUTUBE_BASE_URL}/watch?v=${videoId}`,
      };
    })
    .filter((song) => song !== null);

  const songDurationsSelector =
    "ytmusic-section-list-renderer.description > div:nth-child(2) > ytmusic-shelf-renderer:nth-child(1) > div:nth-child(3) > ytmusic-responsive-list-item-renderer > div:nth-child(8) > yt-formatted-string:nth-child(1)";
  await page.waitForSelector(songDurationsSelector);
  const songDurationElements = await page.$$(songDurationsSelector);
  if (!songDurationElements || songDurationElements.length === 0) {
    await page.close();
    throw new Error("No song lengths found for album");
  }

  const songDurations = (
    await Promise.all(
      songDurationElements.map(async (songDurationElement) => {
        return await page.evaluate((el) => el.textContent, songDurationElement);
      }),
    )
  )
    .filter((duration) => duration !== null)
    .map((duration) => {
      const parts = duration.split(":").map(Number);
      const minutes = parts[0] ?? 0;
      const seconds = parts[1] ?? 0;
      return minutes * 60 + seconds;
    });

  if (songDurations.length !== songInfo.length) {
    await page.close();
    throw new Error("Song durations and song info lengths do not match");
  }

  const songs = songInfo.map((songInfo, index) => ({
    ...songInfo,
    duration: songDurations[index]!,
  }));

  const result = {
    title,
    description,
    imageUrl,
    albumType,
    songs,
  };

  await page.close();
  return result;
}

async function uploadImage(id: string, url: string, bucket: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${url}`);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const webpBuffer = await sharp(Buffer.from(imageBuffer)).webp().toBuffer();
    await blob.putObject(bucket, `${id}.webp`, webpBuffer);
    console.log(`Uploaded ${url} to blob in bucket ${bucket} as ${id}.webp`);
  } catch (error) {
    console.error("Error converting image to webp:", error);
  }
}

async function saveArtistToDatabase(artistData: {
  name: string;
  description: string | null;
  imageUrl: string;
  albums: {
    title: string;
    imageUrl: string;
    description: string | null;
    albumType: "ALBUM" | "EP" | "SINGLE";
    songs: {
      title: string;
      url: string;
      videoId: string;
      duration: number;
    }[];
  }[];
}) {
  console.log("Saving artist to database...");

  // Create the artist
  const artist = await prisma.artist.create({
    data: {
      name: artistData.name,
    },
  });

  console.log(`Created artist: ${artist.name} (${artist.id})`);

  await uploadImage(
    artist.id,
    artistData.imageUrl,
    env.MINIO_BUCKET_NAME_ARTIST_IMAGES,
  );

  // Create albums and songs
  for (const albumData of artistData.albums) {
    const album = await prisma.album.create({
      data: {
        title: albumData.title,
        artistId: artist.id,
        releaseDate: new Date(),
        type: albumData.albumType,
      },
    });

    console.log(`Created album: ${album.title} (${album.id})`);

    await uploadImage(
      album.id,
      albumData.imageUrl,
      env.MINIO_BUCKET_NAME_ALBUM_IMAGES,
    );

    // Create songs for this album
    for (const songData of albumData.songs) {
      try {
        // Create song record first to get the ID
        const song = await prisma.song.create({
          data: {
            title: songData.title,
            duration: songData.duration, // Default duration in seconds
            artistId: artist.id,
            albumId: album.id,
            genre: "Unknown", // Default genre
            releaseDate: new Date(),
          },
        });

        console.log(`Created song: ${song.title} (${song.id})`);

        // Generate a temporary file path using the song ID
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `${song.id}.webm`);

        try {
          console.log(
            `Downloading audio for: ${song.title} from ${songData.url}`,
          );

          // Download audio using yt-dlp (audio only, best quality webm)
          execSync(
            `yt-dlp -f "bestaudio[ext=webm]" -o "${tempFilePath}" "${songData.url}"`,
            { stdio: "inherit" },
          );

          console.log(`Download complete: ${tempFilePath}`);

          // Upload to MinIO
          const objectKey = `${song.id}.webm`;
          await blob.fPutObject(
            env.MINIO_BUCKET_NAME_MUSIC,
            objectKey,
            tempFilePath,
            {
              "Content-Type": "audio/webm",
            },
          );

          console.log(`Uploaded to MinIO: ${objectKey}`);
        } catch (downloadError) {
          console.error(
            `Error downloading/uploading song: ${song.title}`,
            downloadError,
          );
        } finally {
          // Clean up the temporary file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Deleted temporary file: ${tempFilePath}`);
          }
        }
      } catch (songError) {
        console.error(`Error processing song: ${songData.title}`, songError);
      }
    }
  }

  console.log("Database save complete!");
}

async function main() {
  let artistName: string | undefined = undefined;
  if (process.argv.length > 2) {
    artistName = process.argv[2];
  }

  if (!artistName) {
    const answers: { artistName: string } = await inquirer.prompt([
      {
        type: "input",
        name: "artistName",
        message: "Enter the name of the artist you want to scrape:",
      },
    ]);
    artistName = answers.artistName;
  }

  console.log(`Scraping data for artist: ${artistName}`);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: false,
  });

  try {
    const { url: artistUrl } = await getArtistUrl(browser, artistName);
    console.log(`Found artist URL: ${artistUrl}`);

    const artistInfo = await getArtistInfo(browser, artistUrl);
    console.log(`Retrieved artist info for: ${artistInfo.name}`);

    let albumUrls: string[] = [];
    if (artistInfo.albumsUrl) {
      albumUrls = await getAlbumUrls(browser, artistInfo.albumsUrl);
    } else {
      albumUrls = await getAlbumUrlsOther(browser, artistUrl);
    }
    console.log(`Found ${albumUrls.length} albums`);

    const albums: Awaited<ReturnType<typeof getAlbumInfo>>[] = [];

    for (const albumUrl of albumUrls) {
      console.log(`Processing album: ${albumUrl}`);
      const albumInfo = await getAlbumInfo(browser, albumUrl);
      albums.push(albumInfo);
    }

    const artist = {
      name: artistInfo.name,
      description: artistInfo.description,
      imageUrl: artistInfo.imageUrl,
      albums: albums.map((album) => ({
        title: album.title,
        imageUrl: album.imageUrl,
        description: album.description,
        albumType: album.albumType,
        songs: album.songs,
      })),
    };

    // Close the browser immediately after scraping is done
    await browser.close();

    console.log(JSON.stringify(artist, null, 2));

    // Save to database
    await saveArtistToDatabase({
      name: artistInfo.name,
      description: artistInfo.description,
      imageUrl: artistInfo.imageUrl,
      albums: albums.map((album) => ({
        title: album.title,
        description: album.description,
        albumType: album.albumType,
        songs: album.songs,
        imageUrl: album.imageUrl,
      })),
    });
  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
  } finally {
    await prisma.$disconnect();
  }
}

void main();
