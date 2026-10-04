// 予約リクエストのモックデータ(サーバー起動中のみ保持するインメモリDB)
//
// 実際の手数料計算・決済は実装しないが、将来 送客手数料_回収フロー設計.md の
// 二重確認フロー(店舗側Zalo確認 + 顧客側1問アンケート)をそのまま載せられるよう、
// visitConfirmation フィールドに店舗確認・顧客確認を個別に保持する構造にしてある。

import { RESERVATION_STATUS } from "./reservationStatus.js";

// reservations 配列はサーバー内で mutable に扱う(モックAPIのため)
export const reservations = [
  {
    id: "res-0001",
    reservationNumber: "R-0001",
    storeId: "store-001",
    customerName: "山田 太郎",
    customerContact: "taro.yamada@example.com",
    customerEmail: "taro.yamada@example.com",
    partySize: 1,
    preferredSlots: [
      { date: "2026-09-20", time: "14:00" },
      { date: "2026-09-20", time: "16:00" },
      { date: "2026-09-21", time: "10:00" },
    ],
    menuRequested: ["m1-1"],
    note: "肩こりがひどいので重点的にお願いしたいです。",
    status: RESERVATION_STATUS.REQUESTED,
    confirmedSlot: null,
    visitConfirmation: {
      shopConfirmed: false,
      shopConfirmedAt: null,
      customerConfirmed: false,
      customerConfirmedAt: null,
      customerSurveyAnswer: null,
    },
    statusHistory: [{ status: RESERVATION_STATUS.REQUESTED, at: "2026-09-08T09:00:00+07:00" }],
    createdAt: "2026-09-08T09:00:00+07:00",
    updatedAt: "2026-09-08T09:00:00+07:00",
  },
  {
    id: "res-0002",
    reservationNumber: "R-0002",
    storeId: "store-002",
    customerName: "佐藤 花子",
    customerContact: "hanako.sato@example.com",
    customerEmail: "hanako.sato@example.com",
    partySize: 2,
    preferredSlots: [
      { date: "2026-09-18", time: "11:00" },
      { date: "2026-09-19", time: "13:00" },
    ],
    menuRequested: ["m2-2"],
    note: "友人と2人で利用したいです。隣同士の席を希望します。",
    status: RESERVATION_STATUS.APPROVED,
    confirmedSlot: { date: "2026-09-18", time: "11:00" },
    visitConfirmation: {
      shopConfirmed: false,
      shopConfirmedAt: null,
      customerConfirmed: false,
      customerConfirmedAt: null,
      customerSurveyAnswer: null,
    },
    statusHistory: [
      { status: RESERVATION_STATUS.REQUESTED, at: "2026-09-05T10:00:00+07:00" },
      { status: RESERVATION_STATUS.APPROVED, at: "2026-09-05T15:30:00+07:00" },
    ],
    createdAt: "2026-09-05T10:00:00+07:00",
    updatedAt: "2026-09-05T15:30:00+07:00",
  },
  {
    id: "res-0003",
    reservationNumber: "R-0003",
    storeId: "store-008",
    customerName: "鈴木 一郎",
    customerContact: "+81-90-1234-5678",
    customerEmail: "ichiro.suzuki@example.com",
    partySize: 1,
    preferredSlots: [{ date: "2026-09-10", time: "15:00" }],
    menuRequested: ["m8-2"],
    note: "",
    status: RESERVATION_STATUS.VISIT_PENDING,
    confirmedSlot: { date: "2026-09-10", time: "15:00" },
    visitConfirmation: {
      shopConfirmed: false,
      shopConfirmedAt: null,
      customerConfirmed: false,
      customerConfirmedAt: null,
      customerSurveyAnswer: null,
    },
    statusHistory: [
      { status: RESERVATION_STATUS.REQUESTED, at: "2026-09-01T08:00:00+07:00" },
      { status: RESERVATION_STATUS.APPROVED, at: "2026-09-01T12:00:00+07:00" },
      { status: RESERVATION_STATUS.VISIT_PENDING, at: "2026-09-10T15:00:00+07:00" },
    ],
    createdAt: "2026-09-01T08:00:00+07:00",
    updatedAt: "2026-09-10T15:00:00+07:00",
  },
  {
    id: "res-0004",
    reservationNumber: "R-0004",
    storeId: "store-007",
    customerName: "田中 みゆき",
    customerContact: "miyuki.tanaka@example.com",
    customerEmail: "miyuki.tanaka@example.com",
    partySize: 2,
    preferredSlots: [{ date: "2026-09-03", time: "17:00" }],
    menuRequested: ["m7-2"],
    note: "結婚記念日でカップルスパを利用しました。",
    status: RESERVATION_STATUS.COMPLETED,
    confirmedSlot: { date: "2026-09-03", time: "17:00" },
    visitConfirmation: {
      shopConfirmed: true,
      shopConfirmedAt: "2026-09-04T09:00:00+07:00",
      customerConfirmed: true,
      customerConfirmedAt: "2026-09-04T20:00:00+07:00",
      customerSurveyAnswer: "visited",
    },
    statusHistory: [
      { status: RESERVATION_STATUS.REQUESTED, at: "2026-08-28T08:00:00+07:00" },
      { status: RESERVATION_STATUS.APPROVED, at: "2026-08-28T10:00:00+07:00" },
      { status: RESERVATION_STATUS.VISIT_PENDING, at: "2026-09-03T17:00:00+07:00" },
      { status: RESERVATION_STATUS.COMPLETED, at: "2026-09-04T09:00:00+07:00" },
    ],
    createdAt: "2026-08-28T08:00:00+07:00",
    updatedAt: "2026-09-04T20:00:00+07:00",
  },
];

let reservationCounter = reservations.length;

export function nextReservationId() {
  reservationCounter += 1;
  const num = String(reservationCounter).padStart(4, "0");
  return { id: `res-${num}`, reservationNumber: `R-${num}` };
}

export function findReservationById(id) {
  return reservations.find((r) => r.id === id);
}

export function reservationsByStoreId(storeId) {
  return reservations.filter((r) => r.storeId === storeId);
}
