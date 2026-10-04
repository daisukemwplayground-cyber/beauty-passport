// モック店舗データ
//
// 想定エリア: ベトナム・ホーチミン市1区、レタントン通り(Le Thanh Ton)周辺(日本人街)。
// すべて架空の店舗名・住所・口コミです。
//
// feeModel は、送客手数料_回収フロー設計.md にある「1予約あたり定額」の手数料モデルを
// 将来組み込むための拡張フィールド。MVPでは値を null のまま保持し、計算・請求ロジックは実装しない。
// (type: "fixed" | "percentage" | null, amount: 数値 | null)

export const CATEGORIES = ["massage", "spa", "barber"];

export const defaultFeeModel = () => ({
  type: null, // 将来 "fixed"(定額) を設定する想定。パイロット設計上は定率(percentage)は非推奨。
  amount: null,
  currency: "VND",
  note: "MVPでは未設定。将来、送客手数料_回収フロー設計.mdに沿って1予約あたり定額を設定する想定。",
});

// 開発初期に作成した架空(サンプル)店舗4件は、実在する店舗のみを掲載する方針(2026-09-19)により削除済み。
// 起動時点では店舗ゼロ。実店舗は管理画面(またはAPI経由)の新規追加機能で登録する。
export const stores = [];

export function findStoreById(id) {
  return stores.find((s) => s.id === id);
}

// 新規店舗のID発行(既存IDの削除・変更があっても衝突しないよう、既存の最大値+1を採番する)
let storeCounter = stores.reduce((max, s) => {
  const n = parseInt(s.id.replace("store-", ""), 10);
  return Number.isFinite(n) && n > max ? n : max;
}, 0);

export function nextStoreId() {
  storeCounter += 1;
  return `store-${String(storeCounter).padStart(3, "0")}`;
}
