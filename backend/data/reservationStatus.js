// 予約ステータスの定義
//
// 送客手数料_回収フロー設計.md の「二重確認フロー」をそのまま載せられるように、
// 承認後のステータスを細分化してある。
//
// 状態遷移:
//   requested (リクエスト中)
//     -> approved (店舗承認済み)  もしくは -> rejected (却下)
//   approved (店舗承認済み)
//     -> visit_pending (来店確認待ち)  ※来店予定日を過ぎるとシステム上ここに移行する想定
//   visit_pending (来店確認待ち)
//     -> completed (完了)  ※店舗確認・顧客確認のどちらか一方が取れた時点で completed にする
//                             (送客手数料_回収フロー設計.md 2章「④突合」の「片方でも確認できれば成立」に対応)
//     -> no_show (不成立)   ※どちらの確認も取れないまま猶予期間(設計上5営業日)を過ぎた場合
//   requested / approved
//     -> cancelled (キャンセル) ※顧客都合等でのキャンセル
//
// 店舗側確認・顧客側確認は、上記メインステータスとは別に
// reservation.visitConfirmation 以下に個別のフラグとして保持する。
// これにより「店舗確認は済んでいるが顧客未確認」のような中間状態も失わずに記録できる。

export const RESERVATION_STATUS = {
  REQUESTED: "requested", // リクエスト中
  APPROVED: "approved", // 店舗承認済み
  REJECTED: "rejected", // 却下
  VISIT_PENDING: "visit_pending", // 来店確認待ち
  COMPLETED: "completed", // 完了(来店確認済み・手数料計算対象になりうる)
  NO_SHOW: "no_show", // 不成立(来店確認取れず)
  CANCELLED: "cancelled", // キャンセル
};

export const RESERVATION_STATUS_LABELS_JA = {
  requested: "リクエスト中",
  approved: "店舗承認済み",
  rejected: "却下",
  visit_pending: "来店確認待ち",
  completed: "完了",
  no_show: "不成立(来店確認なし)",
  cancelled: "キャンセル",
};

export const RESERVATION_STATUS_LABELS_EN = {
  requested: "Requested",
  approved: "Approved by shop",
  rejected: "Rejected",
  visit_pending: "Awaiting visit confirmation",
  completed: "Completed",
  no_show: "No-show (unconfirmed)",
  cancelled: "Cancelled",
};

// 有効な状態遷移(店舗管理画面のバリデーションに使用)
export const ALLOWED_TRANSITIONS = {
  requested: ["approved", "rejected", "cancelled"],
  approved: ["visit_pending", "cancelled"],
  visit_pending: ["completed", "no_show"],
  rejected: [],
  completed: [],
  no_show: [],
  cancelled: [],
};
