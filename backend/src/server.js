import "dotenv/config";
import cors from "cors";
import express from "express";
import shortenRouter from "./routes/shorten.js";
import { findById } from "./services/storage.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const DEFAULT_ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);
const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

for (const origin of FRONTEND_ORIGIN.split(",")) {
  const normalized = origin.trim();
  if (normalized) {
    DEFAULT_ALLOWED_ORIGINS.add(normalized);
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin header (curl, health checks, same-origin).
      if (!origin) {
        return callback(null, true);
      }

      if (DEFAULT_ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }

      // Allow any localhost/127.0.0.1 port to support Vite fallback ports.
      if (LOCALHOST_ORIGIN_REGEX.test(origin)) {
        return callback(null, true);
      }

      // Deny unknown origins without throwing noisy server errors.
      return callback(null, false);
    }
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", shortenRouter);

app.get("/:id", async (req, res) => {
  try {
    const item = await findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Short link not found" });
    }

    return res.redirect(302, item.originalUrl);
  } catch {
    return res.status(500).json({ error: "Failed to resolve short link" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
});
