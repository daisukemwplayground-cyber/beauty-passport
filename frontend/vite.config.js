import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// バックエンド(モックAPI, http://localhost:4000)へのリクエストは
// 開発サーバーの /api を通してプロキシする。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Tailscale等のプライベートネットワーク経由でスマホ・他PCからアクセスできるよう、
    // localhostだけでなく全インターフェースでリッスンする。
    host: true,
    // 一時的な外部公開(Cloudflare Tunnel等)からのアクセスを許可する。
    // デモ・確認用の一時設定のため、本番運用時は特定ホストに絞ること。
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
