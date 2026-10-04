import { Router } from "express";
import { notifications } from "../data/notifications.js";

const router = Router();

// GET /api/notifications?reservationId=xxx
// 開発確認用・店舗管理画面「通知ログ」タブ用のエンドポイント。
// 実際にメールは送信していないため、ここが「送信されたであろう内容」の唯一の記録。
router.get("/", (req, res) => {
  const { reservationId } = req.query;
  let results = [...notifications];
  if (reservationId) results = results.filter((n) => n.reservationId === reservationId);
  // 新しい通知が上に来るよう送信日時降順
  results.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
  res.json({ count: results.length, results });
});

export default router;
