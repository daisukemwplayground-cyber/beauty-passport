import { Router } from "express";

const router = Router();

// 簡易ログイン(モックMVP用。実運用のセキュリティレベルではない)
// パスワードは環境変数 ADMIN_PASSWORD で上書き可能、デフォルトは "admin1234"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    // モックのため固定トークンを返す(実運用ではJWT等に置き換える)
    return res.json({ token: "mock-admin-token", ok: true });
  }
  return res.status(401).json({ ok: false, error: "invalid password" });
});

export default router;
