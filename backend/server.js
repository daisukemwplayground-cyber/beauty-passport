import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import storesRouter from "./routes/stores.js";
import reservationsRouter from "./routes/reservations.js";
import adminRouter from "./routes/admin.js";
import notificationsRouter from "./routes/notifications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
// 店舗管理画面からアップロードされた写真の配信(routes/stores.jsのアップロード先と一致させる)
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "beauty-booking-mvp-backend", time: new Date().toISOString() });
});

app.use("/api/stores", storesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationsRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: `not found: ${req.method} ${req.originalUrl}` });
});

// 本番運用: フロントエンド(Viteビルド済みの静的ファイル)を同じサーバーから配信する。
// これによりフロントエンドの `/api` 相対パス呼び出しがそのまま同一オリジンで動作する。
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: `not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

app.listen(PORT, () => {
  console.log(`[mock-api] listening on http://localhost:${PORT}`);
});
