// 新しい予約リクエストが入ったときに、運営者(あなた)自身のDiscordへ通知を送る仕組み。
// 店舗向けの管理画面は作らず、「顧客情報が運営者に届く→運営者がコピーしてZaloで店舗に確認する」
// という運用(事業計画書.md参照)を成立させるための最小実装。
//
// 使い方: backend/.env に DISCORD_WEBHOOK_URL=<Discordのwebhook URL> を設定する。
// 未設定の場合は通知をスキップし、コンソールに警告を出すだけで予約作成自体は失敗させない。

import { findStoreById } from "../data/stores.js";

function formatSlots(slots) {
  if (!slots || slots.length === 0) return "(指定なし)";
  return slots.map((s) => `- ${s.date} ${s.time}`).join("\n");
}

function formatMenu(store, menuIds) {
  if (!menuIds || menuIds.length === 0) return "(指定なし)";
  const menu = store?.menu || [];
  const names = menuIds.map((id) => menu.find((m) => m.id === id)?.name || id);
  return names.join("、");
}

export async function notifyNewReservation(reservation) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[discordNotify] DISCORD_WEBHOOK_URL が未設定のため、通知をスキップしました。");
    return;
  }

  const store = findStoreById(reservation.storeId);
  const content = [
    `🔔 新しい予約リクエスト (${reservation.reservationNumber})`,
    `店舗: ${store ? store.name : reservation.storeId}`,
    "",
    `お客様: ${reservation.customerName}`,
    `連絡先: ${reservation.customerContact}`,
    `メール: ${reservation.customerEmail}`,
    `人数: ${reservation.partySize}名`,
    "",
    `希望メニュー: ${formatMenu(store, reservation.menuRequested)}`,
    "希望日時:",
    formatSlots(reservation.preferredSlots),
    "",
    `備考: ${reservation.note || "(なし)"}`,
  ].join("\n");

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      console.error(`[discordNotify] Discordへの送信に失敗しました (status: ${res.status})`);
    }
  } catch (err) {
    // 通知の失敗が予約作成自体を止めないよう、ここで握りつぶしてログにだけ残す。
    console.error("[discordNotify] Discordへの送信中にエラーが発生しました:", err.message);
  }
}
