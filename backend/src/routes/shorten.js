import express from "express";
import { nanoid } from "nanoid";
import { fetchMetadata } from "../services/metadata.js";
import { findByOriginalUrl, saveLink } from "../services/storage.js";
import { validateUrl } from "../services/validation.js";

const router = express.Router();
const SHORT_ID_LENGTH = 7;

router.post("/shorten", async (req, res) => {
  const { url } = req.body ?? {};
  const validationResult = validateUrl(url);

  if (!validationResult.valid) {
    return res.status(400).json({ error: validationResult.message });
  }

  const normalizedUrl = validationResult.normalizedUrl;

  try {
    const existing = await findByOriginalUrl(normalizedUrl);

    if (existing) {
      return res.json({
        id: existing.id,
        shortUrl: `${req.protocol}://${req.get("host")}/${existing.id}`,
        preview: existing.preview
      });
    }

    let preview;
    try {
      preview = await fetchMetadata(normalizedUrl);
    } catch {
      const hostname = new URL(normalizedUrl).hostname;
      preview = {
        title: hostname,
        description: "Metadata is unavailable for this URL",
        image: null
      };
    }

    const id = nanoid(SHORT_ID_LENGTH);

    await saveLink({
      id,
      originalUrl: normalizedUrl,
      preview,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      id,
      shortUrl: `${req.protocol}://${req.get("host")}/${id}`,
      preview
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to shorten URL",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
