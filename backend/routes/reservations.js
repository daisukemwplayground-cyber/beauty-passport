import { Router } from "express";
import {
  reservations,
  nextReservationId,
  findReservationById,
} from "../data/reservations.js";
import { findStoreById } from "../data/stores.js";
import {
  RESERVATION_STATUS,
  ALLOWED_TRANSITIONS,
} from "../data/reservationStatus.js";
import { recordNotification } from "../data/notifications.js";
import { notifyNewReservation } from "../services/discordNotify.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = Router();

// GET /api/reservations?storeId=&status=  — 店舗管理画面の一覧取得用
router.get("/", (req, res) => {
  const { storeId, status } = req.query;
  let results = [...reservations];
  if (storeId) results = results.filter((r) => r.storeId === storeId);
  if (status) results = results.filter((r) => r.status === status);
  // 新しいリクエストが上に来るよう作成日時降順
  results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ count: results.length, results });
});

router.get("/:id", (req, res) => {
  const reservation = findReservationById(req.params.id);
  if (!reservation) return res.status(404).json({ error: "reservation not found" });
  res.json(reservation);
});

// POST /api/reservations — ユーザーからの予約リクエスト送信
router.post("/", (req, res) => {
  const { storeId, customerName, customerContact, customerEmail, partySize, preferredSlots, menuRequested, note } = req.body;

  if (!storeId || !findStoreById(storeId)) {
    return res.status(400).json({ error: "invalid storeId" });
  }
  if (!customerName) {
    return res.status(400).json({ error: "customerName is required" });
  }
  // customerEmail は「店舗承認/却下/来店完了」通知の宛先、および顧客向け予約照会ページでの
  // 本人確認に使うため必須。customerContact(電話番号)は任意の追加連絡先(2026-09-17: 連絡先は
  // メールまたは電話に限定する方針に変更。LINE等の自由記入は廃止し、必須項目もメールのみに一本化)。
  if (!customerEmail || !EMAIL_PATTERN.test(String(customerEmail).trim())) {
    return res.status(400).json({ error: "a valid customerEmail is required" });
  }
  if (customerContact && !/^[0-9+\-\s()]{6,20}$/.test(String(customerContact).trim())) {
    return res.status(400).json({ error: "customerContact must be a valid phone number (digits, spaces, +, - only)" });
  }
  if (!Array.isArray(preferredSlots) || preferredSlots.length === 0) {
    return res.status(400).json({ error: "preferredSlots must be a non-empty array (2-3 candidates recommended)" });
  }

  const { id, reservationNumber } = nextReservationId();
  const now = new Date().toISOString();

  const reservation = {
    id,
    reservationNumber,
    storeId,
    customerName,
    customerContact,
    customerEmail: String(customerEmail).trim(),
    partySize: partySize || 1,
    preferredSlots,
    menuRequested: menuRequested || [],
    note: note || "",
    status: RESERVATION_STATUS.REQUESTED,
    confirmedSlot: null,
    visitConfirmation: {
      shopConfirmed: false,
      shopConfirmedAt: null,
      customerConfirmed: false,
      customerConfirmedAt: null,
      customerSurveyAnswer: null,
    },
    statusHistory: [{ status: RESERVATION_STATUS.REQUESTED, at: now }],
    createdAt: now,
    updatedAt: now,
  };

  reservations.push(reservation);
  res.status(201).json(reservation);

  // 運営者(あなた)のDiscordへ通知。失敗しても予約作成のレスポンスには影響させない(fire-and-forget)。
  notifyNewReservation(reservation).catch(() => {});
});

// PATCH /api/reservations/:id/status — 店舗管理画面からの承認/却下/状態遷移
// body: { status: "approved" | "rejected" | "visit_pending" | "completed" | "no_show" | "cancelled", confirmedSlot? }
router.patch("/:id/status", (req, res) => {
  const reservation = findReservationById(req.params.id);
  if (!reservation) return res.status(404).json({ error: "reservation not found" });

  const { status, confirmedSlot } = req.body;
  if (!status || !Object.values(RESERVATION_STATUS).includes(status)) {
    return res.status(400).json({ error: "invalid status value" });
  }

  const allowed = ALLOWED_TRANSITIONS[reservation.status] || [];
  if (!allowed.includes(status)) {
    return res.status(409).json({
      error: `cannot transition from "${reservation.status}" to "${status}"`,
      allowedTransitions: allowed,
    });
  }

  reservation.status = status;
  if (status === RESERVATION_STATUS.APPROVED && confirmedSlot) {
    reservation.confirmedSlot = confirmedSlot;
  }
  const now = new Date().toISOString();
  reservation.updatedAt = now;
  reservation.statusHistory.push({ status, at: now });

  // requested -> approved / requested -> rejected のタイミングで、
  // 顧客宛の「通知」(モック送信履歴)を1件記録する(実際のメール送信は行わない)。
  if (status === RESERVATION_STATUS.APPROVED || status === RESERVATION_STATUS.REJECTED) {
    recordNotification(status, reservation, findStoreById(reservation.storeId));
  }

  res.json(reservation);
});

// POST /api/reservations/lookup — 顧客向け予約照会。予約番号 + メールアドレスの両方が
// 一致した場合のみ、その予約の詳細を返す(どちらか一方だけでは他人の予約が見えてしまうため、
// 必ず両方を突き合わせて認可する)。
router.post("/lookup", (req, res) => {
  const { reservationNumber, email } = req.body;
  if (!reservationNumber || !email) {
    return res.status(400).json({ error: "reservationNumber and email are required" });
  }
  const normalizedNumber = String(reservationNumber).trim().toUpperCase();
  const normalizedEmail = String(email).trim().toLowerCase();

  const reservation = reservations.find(
    (r) =>
      r.reservationNumber.toUpperCase() === normalizedNumber &&
      (r.customerEmail || "").toLowerCase() === normalizedEmail
  );

  if (!reservation) {
    return res.status(404).json({ error: "no reservation found matching that reservation number and email" });
  }

  const store = findStoreById(reservation.storeId);
  res.json({
    reservation,
    store: store
      ? {
          id: store.id,
          name: store.name,
          area: store.area,
          address: store.address,
          businessHours: store.businessHours,
        }
      : null,
  });
});

// POST /api/reservations/:id/confirm-visit/shop
// 将来の二重確認フロー(送客手数料_回収フロー設計.md)を見据えた拡張エンドポイント。
// 店舗側からのZalo定型メッセージ受信を運営者が代理入力する想定。
router.post("/:id/confirm-visit/shop", (req, res) => {
  const reservation = findReservationById(req.params.id);
  if (!reservation) return res.status(404).json({ error: "reservation not found" });
  if (reservation.status !== RESERVATION_STATUS.VISIT_PENDING) {
    return res.status(409).json({ error: `reservation must be in "visit_pending" status (current: "${reservation.status}")` });
  }
  const now = new Date().toISOString();
  reservation.visitConfirmation.shopConfirmed = true;
  reservation.visitConfirmation.shopConfirmedAt = now;
  applyDoubleConfirmationRule(reservation, now);
  res.json(reservation);
});

// POST /api/reservations/:id/confirm-visit/customer
// 顧客側の口コミ投稿と兼ねた1問アンケート回答を想定。body: { visited: boolean }
router.post("/:id/confirm-visit/customer", (req, res) => {
  const reservation = findReservationById(req.params.id);
  if (!reservation) return res.status(404).json({ error: "reservation not found" });
  if (reservation.status !== RESERVATION_STATUS.VISIT_PENDING) {
    return res.status(409).json({ error: `reservation must be in "visit_pending" status (current: "${reservation.status}")` });
  }
  const { visited } = req.body;
  const now = new Date().toISOString();
  reservation.visitConfirmation.customerSurveyAnswer = visited ? "visited" : "not_visited";
  if (visited) {
    reservation.visitConfirmation.customerConfirmed = true;
    reservation.visitConfirmation.customerConfirmedAt = now;
  }
  applyDoubleConfirmationRule(reservation, now);
  res.json(reservation);
});

// 送客手数料_回収フロー設計.md 2章「④突合」: 店舗確認・顧客確認のどちらか一方でも
// 取れれば「来店確定」= completed とする。
function applyDoubleConfirmationRule(reservation, now) {
  const { shopConfirmed, customerConfirmed } = reservation.visitConfirmation;
  if ((shopConfirmed || customerConfirmed) && reservation.status === RESERVATION_STATUS.VISIT_PENDING) {
    reservation.status = RESERVATION_STATUS.COMPLETED;
    reservation.updatedAt = now;
    reservation.statusHistory.push({ status: RESERVATION_STATUS.COMPLETED, at: now });
    // visit_pending -> completed のタイミングでも、お礼の通知(モック送信履歴)を記録する。
    recordNotification(RESERVATION_STATUS.COMPLETED, reservation, findStoreById(reservation.storeId));
  }
}

export default router;
