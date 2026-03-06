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

function pickFirstNonEmpty(values) {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function isLikelyDecorativeImage(src, width, height) {
  const normalizedSrc = (src || "").toLowerCase();
  const w = Number.parseInt(width || "", 10);
  const h = Number.parseInt(height || "", 10);

  if (!normalizedSrc) {
    return true;
  }

  if (
    normalizedSrc.includes("img/0.gif") ||
    normalizedSrc.includes("spacer") ||
    normalizedSrc.includes("pixel") ||
    normalizedSrc.includes("blank")
  ) {
    return true;
  }

  if (
    Number.isFinite(w) &&
    Number.isFinite(h) &&
    w > 0 &&
    h > 0 &&
    (w <= 20 || h <= 20)
  ) {
    return true;
  }

  return false;
}

function pickImageCandidate($) {
  // 1) Standard social tags.
  const socialImage = pickFirstNonEmpty([
    $('meta[property="og:image"]').attr("content"),
    $('meta[property="og:image:url"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[name="twitter:image:src"]').attr("content"),
    $('meta[itemprop="image"]').attr("content"),
    $('link[rel="image_src"]').attr("href")
  ]);

  if (socialImage) {
    return socialImage;
  }

  // 2) Try article/content image before generic site icons.
  const contentImage = $("article img, .pages_content img, .content img, .post img")
    .map((_, el) => {
      const src = normalizeText($(el).attr("src"));
      const width = $(el).attr("width");
      const height = $(el).attr("height");

      if (isLikelyDecorativeImage(src, width, height)) {
        return null;
      }

      return src;
    })
    .get()
    .find((src) => Boolean(src));

  if (contentImage) {
    return contentImage;
  }

  // 3) Last resort: site-level icon/tile image.
  return pickFirstNonEmpty([
    $('meta[name="msapplication-TileImage"]').attr("content"),
    $('link[rel="apple-touch-icon"]').first().attr("href"),
    $('link[rel="icon"]').first().attr("href"),
    $('link[rel="shortcut icon"]').attr("href")
  ]);
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

  const imageRaw = pickImageCandidate($);

  return {
    title,
    description,
    image: toAbsoluteUrl(imageRaw, targetUrl)
  };
}
