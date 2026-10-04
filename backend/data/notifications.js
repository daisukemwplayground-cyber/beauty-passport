// 「通知」のモック送信履歴
//
// 実際のSMTP送信は行わない(認証情報が無いため)。
// ステータスが requested→approved / requested→rejected / visit_pending→completed に
// 変化するタイミングで、「本来この内容のメールが顧客に送られたはず」という
// 通知オブジェクトを生成し、このインメモリ配列に記録する。
// 店舗管理画面の「通知ログ」タブ、および GET /api/notifications で目視確認できる。

import { reservations } from "./reservations.js";
import { findStoreById } from "./stores.js";

export const notifications = [];

let notificationCounter = 0;

function nextNotificationId() {
  notificationCounter += 1;
  return `ntf-${String(notificationCounter).padStart(4, "0")}`;
}

const SERVICE_NAME = "Beauty Passport";

function formatSlot(slot) {
  if (!slot) return "(未定)";
  return `${slot.date} ${slot.time}`;
}

// type: "approved" | "rejected" | "completed"
export function buildNotificationContent(type, reservation, store) {
  const storeName = store ? store.name : reservation.storeId;
  const customerName = reservation.customerName;
  const reservationNumber = reservation.reservationNumber;

  if (type === "approved") {
    return {
      subject: `【${SERVICE_NAME}】ご予約確定のお知らせ(予約番号: ${reservationNumber})`,
      body: `${customerName} 様

いつも${SERVICE_NAME}をご利用いただきありがとうございます。
以下のご予約が店舗より承認されましたのでお知らせいたします。

予約番号: ${reservationNumber}
店舗名: ${storeName}
確定日時: ${formatSlot(reservation.confirmedSlot)}

当日はお時間に余裕を持ってお越しください。
この度はご予約誠にありがとうございました。

${SERVICE_NAME}`,
    };
  }

  if (type === "rejected") {
    return {
      subject: `【${SERVICE_NAME}】ご予約についてのお知らせ(予約番号: ${reservationNumber})`,
      body: `${customerName} 様

ご予約リクエストいただきありがとうございました。
誠に申し訳ございませんが、今回は店舗都合により下記のご予約をお受けすることができませんでした。

予約番号: ${reservationNumber}
店舗名: ${storeName}

お手数をおかけしますが、他の店舗・日時にて改めてご検討いただけますと幸いです。

${SERVICE_NAME}`,
    };
  }

  if (type === "completed") {
    return {
      subject: `【${SERVICE_NAME}】ご来店ありがとうございました(予約番号: ${reservationNumber})`,
      body: `${customerName} 様

この度は${storeName}にご来店いただき誠にありがとうございました。
以下のご予約は「完了」として記録されました。

予約番号: ${reservationNumber}
店舗名: ${storeName}
ご来店日時: ${formatSlot(reservation.confirmedSlot)}

またのご利用を心よりお待ちしております。

${SERVICE_NAME}`,
    };
  }

  return { subject: `【${SERVICE_NAME}】お知らせ`, body: "" };
}

// 予約のステータス変化に応じて通知(モック送信履歴)を1件記録する。
export function recordNotification(type, reservation, store) {
  const { subject, body } = buildNotificationContent(type, reservation, store);
  const notification = {
    id: nextNotificationId(),
    reservationId: reservation.id,
    reservationNumber: reservation.reservationNumber,
    type,
    to: reservation.customerEmail,
    subject,
    body,
    sentAt: new Date().toISOString(),
  };
  notifications.push(notification);
  return notification;
}

export function notificationsByReservationId(reservationId) {
  return notifications.filter((n) => n.reservationId === reservationId);
}

// --- デモ用シード ---
// reservations.js の初期モックデータのうち、既に approved / completed の状態で
// 用意されている予約(res-0002, res-0004)についても、通知ログタブが最初から
// 空っぽにならないよう、それらしい通知履歴を初期化しておく。
const seedApproved = reservations.find((r) => r.id === "res-0002");
if (seedApproved) {
  recordNotification("approved", seedApproved, findStoreById(seedApproved.storeId));
}
const seedCompleted = reservations.find((r) => r.id === "res-0004");
if (seedCompleted) {
  recordNotification("completed", seedCompleted, findStoreById(seedCompleted.storeId));
}
