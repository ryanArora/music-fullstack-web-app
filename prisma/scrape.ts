import puppeteer, { Browser } from "puppeteer";
import inquirer from "inquirer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const YOUTUBE_MUSIC_BASE_URL = "https://music.youtube.com";
const YOUTUBE_BASE_URL = "https://www.youtube.com";

export async function getArtistUrl(browser: Browser, artistName: string) {
  const page = await browser.newPage();
  await page.goto(`${YOUTUBE_MUSIC_BASE_URL}/search?q=${artistName}`);

  const selectorImage =
    "ytmusic-thumbnail-renderer.ytmusic-card-shelf-renderer > yt-img-shadow:nth-child(1) > img:nth-child(1)";
  await page.waitForSelector(selectorImage);
  const image = await page.$eval(selectorImage, (el) => el!.src);
  if (!image) {
    await page.close();
    throw new Error("Artist image not found");
  }

  const selector =
    "html.inactive-player.no-focus-outline body ytmusic-app ytmusic-app-layout#layout.style-scope.ytmusic-app div#content.style-scope.ytmusic-app ytmusic-search-page#search-page.style-scope.ytmusic-app ytmusic-tabbed-search-results-renderer.style-scope.ytmusic-search-page div.content.style-scope.ytmusic-tabbed-search-results-renderer ytmusic-section-list-renderer.style-scope.ytmusic-tabbed-search-results-renderer div#contents.style-scope.ytmusic-section-list-renderer ytmusic-card-shelf-renderer.style-scope.ytmusic-section-list-renderer div.card-container.style-scope.ytmusic-card-shelf-renderer div.card-content-container.style-scope.ytmusic-card-shelf-renderer div.main-card-container.style-scope.ytmusic-card-shelf-renderer div.main-card-content-container.style-scope.ytmusic-card-shelf-renderer div.details-container.style-scope.ytmusic-card-shelf-renderer div.metadata-container.style-scope.ytmusic-card-shelf-renderer yt-formatted-string.title.style-scope.ytmusic-card-shelf-renderer a.yt-simple-endpoint.style-scope.yt-formatted-string";

  await page.waitForSelector(selector);
  const artistPageLink = await page.$(selector);
  if (!artistPageLink) throw new Error("Artist page link not found");

  const artistPageUrl = await page.evaluate(
    (el) => el!.getAttribute("href"),
    artistPageLink,
  );
  if (!artistPageUrl) throw new Error("Artist page URL attribute not found");
  if (!artistPageUrl.startsWith("channel/"))
    throw new Error("Invalid artist page URL format");

  await page.close();
  return {
    url: `${YOUTUBE_MUSIC_BASE_URL}/${artistPageUrl}`,
    image,
  };
}

export async function getArtistInfo(browser: Browser, artistPageUrl: string) {
  const page = await browser.newPage();
  await page.goto(artistPageUrl);

  const selectorName = "h1.style-scope > yt-formatted-string:nth-child(1)";
  let name: string;
  try {
    await page.waitForSelector(selectorName, { timeout: 1000 });
    const nameText = await page.$eval(selectorName, (el) => el!.textContent);
    if (!nameText) throw new Error("Artist name not found");
    name = nameText;
  } catch (error) {
    await page.close();
    throw new Error("Failed to extract artist name");
  }

  const selectorDescription =
    ".description-container > yt-formatted-string:nth-child(1)";
  let description: string | null = null;
  try {
    await page.waitForSelector(selectorDescription, { timeout: 1000 });
    description = await page.$eval(
      selectorDescription,
      (el) => el!.textContent,
    );
  } catch (error) {
    // Description can be null, so we don't throw here
  }

  const selectorAlbumsUrls =
    "ytmusic-carousel-shelf-renderer.style-scope:nth-child(2) > div:nth-child(1) > div:nth-child(1) > ytmusic-carousel-shelf-basic-header-renderer:nth-child(1) > h2:nth-child(2) > div:nth-child(2) > yt-formatted-string:nth-child(1) > a:nth-child(1)";
  await page.waitForSelector(selectorAlbumsUrls);
  const albumsLink = await page.$(selectorAlbumsUrls);
  if (!albumsLink) {
    await page.close();
    throw new Error("Albums link not found");
  }

  const albumsUrl = await page.evaluate(
    (el) => el!.getAttribute("href"),
    albumsLink,
  );
  if (!albumsUrl) {
    await page.close();
    throw new Error("Albums URL attribute not found");
  }
  if (!albumsUrl.startsWith("browse/")) {
    await page.close();
    throw new Error("Invalid albums URL format");
  }
  await page.close();

  return {
    name,
    description,
    albumsUrl: `${YOUTUBE_MUSIC_BASE_URL}/${albumsUrl}`,
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
        (el) => el!.getAttribute("href"),
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

async function getAlbumInfo(browser: Browser, albumUrl: string) {
  const page = await browser.newPage();
  await page.goto(albumUrl);

  const titleSelector = "h1.style-scope > yt-formatted-string:nth-child(1)";
  await page.waitForSelector(titleSelector);
  const title = await page.$eval(titleSelector, (el) => el!.textContent);
  if (!title) {
    await page.close();
    throw new Error("Album title not found");
  }

  const descriptionSelector = "yt-formatted-string.description";
  let description: string | null = null;
  try {
    await page.waitForSelector(descriptionSelector, { timeout: 1000 });
    description = await page.$eval(
      descriptionSelector,
      (el) => el!.textContent,
    );
  } catch (error) {
    // Description can be null, so we don't throw here
  }

  const albumTypeSelector =
    "yt-formatted-string.ytmusic-responsive-header-renderer:nth-child(2) > span:nth-child(1)";
  let albumType: "ALBUM" | "EP" | "SINGLE" = "ALBUM"; // Default value
  try {
    await page.waitForSelector(albumTypeSelector, { timeout: 1000 });
    const albumTypeRaw = await page.$eval(
      albumTypeSelector,
      (el) => el!.textContent,
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
  } catch (error) {
    // Use default album type if not found
  }

  const imageSelector =
    "ytmusic-thumbnail-renderer.thumbnail > yt-img-shadow:nth-child(1) > img:nth-child(1)";
  await page.waitForSelector(imageSelector);
  const image = await page.$eval(imageSelector, (el) => el!.src);
  if (!image) {
    await page.close();
    throw new Error("Album image not found");
  }

  const songsSelector =
    "ytmusic-responsive-list-item-renderer.style-scope > div:nth-child(5) > div:nth-child(1) > yt-formatted-string:nth-child(1) > a:nth-child(1)";
  await page.waitForSelector(songsSelector);
  const songs = await page.$$(songsSelector);
  if (!songs || songs.length === 0) {
    await page.close();
    throw new Error("No songs found for album");
  }

  const songInfo = await Promise.all(
    songs.map(async (song) => {
      const songData = await page.evaluate(
        (el) => ({
          title: el!.textContent,
          url: el!.getAttribute("href"),
        }),
        song,
      );
      return songData;
    }),
  );

  await page.close();

  const validSongs = songInfo.filter(
    (song) =>
      song.url !== null &&
      song.title !== null &&
      song.url.startsWith("watch?v="),
  );

  if (validSongs.length === 0) {
    throw new Error("No valid songs found for album");
  }

  return {
    title,
    description,
    image,
    albumType,
    songs: validSongs.map((song) => {
      const url = new URL(`${YOUTUBE_MUSIC_BASE_URL}/${song.url}`);
      const videoId = url.searchParams.get("v");

      if (!videoId) {
        throw new Error("Invalid song URL: missing video ID");
      }

      return {
        title: song.title!,
        url: `${YOUTUBE_BASE_URL}/watch?v=${videoId}`,
        videoId,
      };
    }),
  };
}

async function saveArtistToDatabase(artistData: {
  name: string;
  description: string | null;
  image: string;
  albums: {
    title: string;
    image: string;
    description: string | null;
    albumType: "ALBUM" | "EP" | "SINGLE";
    songs: {
      title: string;
      url: string;
      videoId: string;
    }[];
  }[];
}) {
  console.log("Saving artist to database...");

  // Create the artist
  const artist = await prisma.artist.create({
    data: {
      name: artistData.name,
      imageUrl: artistData.image,
    },
  });

  console.log(`Created artist: ${artist.name} (${artist.id})`);

  // Create albums and songs
  for (const albumData of artistData.albums) {
    const album = await prisma.album.create({
      data: {
        title: albumData.title,
        imageUrl: albumData.image,
        artistId: artist.id,
        releaseDate: new Date(),
        type: albumData.albumType,
      },
    });

    console.log(`Created album: ${album.title} (${album.id})`);

    // Create songs for this album
    for (const songData of albumData.songs) {
      const song = await prisma.song.create({
        data: {
          title: songData.title,
          url: songData.url,
          duration: 180, // Default duration in seconds
          imageUrl: albumData.image,
          artistId: artist.id,
          albumId: album.id,
          genre: "Unknown", // Default genre
          releaseDate: new Date(),
        },
      });

      console.log(`Created song: ${song.title} (${song.id})`);
    }
  }

  console.log("Database save complete!");
}

async function main() {
  // Prompt for artist name
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "artistName",
      message: "Enter the name of the artist you want to scrape:",
    },
  ]);

  const artistName = answers.artistName;
  console.log(`Scraping data for artist: ${artistName}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  try {
    const { url: artistUrl, image: artistImage } = await getArtistUrl(
      browser,
      artistName,
    );
    console.log(`Found artist URL: ${artistUrl}`);

    const artistInfo = await getArtistInfo(browser, artistUrl);
    console.log(`Retrieved artist info for: ${artistInfo.name}`);

    const albumUrls = await getAlbumUrls(browser, artistInfo.albumsUrl);
    console.log(`Found ${albumUrls.length} albums`);

    const albums = [];

    for (const albumUrl of albumUrls) {
      console.log(`Processing album: ${albumUrl}`);
      const albumInfo = await getAlbumInfo(browser, albumUrl);
      albums.push(albumInfo);
    }

    const artist = {
      name: artistInfo.name,
      description: artistInfo.description,
      image: artistImage,
      albums,
    };

    console.log(JSON.stringify(artist, null, 2));

    // Save to database
    await saveArtistToDatabase(artist);
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main().catch(console.error);
