import cors from "cors";
import express from "express";
import shortenRouter from "./routes/shorten.js";
import { findById } from "./services/storage.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
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
