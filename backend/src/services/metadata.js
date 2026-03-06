import axios from "axios";
import * as cheerio from "cheerio";

function normalizeText(value) {
  return (value ?? "").trim();
}

function toAbsoluteUrl(maybeRelative, baseUrl) {
  if (!maybeRelative) {
    return null;
  }

  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return null;
  }
}

export async function fetchMetadata(targetUrl) {
  const response = await axios.get(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 URLShortenerPreviewBot/1.0"
    },
    maxRedirects: 5,
    validateStatus: () => true
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to fetch URL metadata: HTTP ${response.status}`);
  }

  const html = response.data;
  const $ = cheerio.load(html);

  const title =
    normalizeText($('meta[property="og:title"]').attr("content")) ||
    normalizeText($("title").first().text()) ||
    "No title";

  const description =
    normalizeText($('meta[property="og:description"]').attr("content")) ||
    normalizeText($('meta[name="description"]').attr("content")) ||
    "No description";

  const imageRaw =
    normalizeText($('meta[property="og:image"]').attr("content")) || null;

  return {
    title,
    description,
    image: toAbsoluteUrl(imageRaw, targetUrl)
  };
}
