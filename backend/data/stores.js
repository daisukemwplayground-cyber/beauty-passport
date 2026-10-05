// モック店舗データ
//
// 想定エリア: ベトナム・ホーチミン市1区、レタントン通り(Le Thanh Ton)周辺(日本人街)。
//
// feeModel は、送客手数料_回収フロー設計.md にある「1予約あたり定額」の手数料モデルを
// 将来組み込むための拡張フィールド。MVPでは値を null のまま保持し、計算・請求ロジックは実装しない。
// (type: "fixed" | "percentage" | null, amount: 数値 | null)

export const CATEGORIES = ["massage", "spa", "barber"];

// 支払い方法の選択肢(表示ラベルは frontend の i18n payment.* キー)
export const PAYMENT_METHODS = ["cash", "card", "qr"];

// tipIncluded: true = 料金にチップ込み / false = チップ別途 / null = 未確認
// paymentMethods: PAYMENT_METHODS の部分集合。空配列 = 未確認

export const defaultFeeModel = () => ({
  type: null, // 将来 "fixed"(定額) を設定する想定。パイロット設計上は定率(percentage)は非推奨。
  amount: null,
  currency: "VND",
  note: "MVPでは未設定。将来、送客手数料_回収フロー設計.mdに沿って1予約あたり定額を設定する想定。",
});

// 開発初期に作成した架空(サンプル)店舗4件は、実在する店舗のみを掲載する方針(2026-09-19)により削除済み。
// 実店舗は管理画面(またはAPI経由)の新規追加機能で登録する。
//
// 営業デモ用の仮データ(2026-10-05): ホーチミン1区に実在するスパ5店舗を、Web上の公開情報
// (店名・住所・営業時間・おおよその価格帯)をもとに仮登録している。店舗との掲載契約はまだ無い。
// - メニューは公開されている「〜から」価格などをもとにした目安で、正式な料金表ではない。
// - 緯度経度は住所からのおおよその値。写真は未登録(no-photo表示)。
// - 評価・口コミは捏造しないため 0件 のまま。
// - チップ込みかどうか・支払い方法は未確認のため null / 空配列(画面上は「要確認」と表示)。
// 本番公開前に、各店舗の確認を取るか、このデータを削除すること。
const sampleStore = (fields) => ({
  nameVi: "",
  rating: 0,
  reviewCount: 0,
  photos: [],
  reviews: [],
  tipIncluded: null,
  paymentMethods: [],
  feeModel: defaultFeeModel(),
  ...fields,
});

export const stores = [
  sampleStore({
    id: "store-001",
    category: "spa",
    name: "Sen Spa",
    area: "Le Thanh Ton",
    address: "10B1 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    addressEn: "10B1 Le Thanh Ton St, Ben Nghe Ward, District 1, Ho Chi Minh City",
    lat: 10.7807,
    lng: 106.7045,
    priceRangeMin: 500000,
    priceRangeMax: 1500000,
    description:
      "2003年創業の老舗スパ。日本人街レタントン通りにあり、ベトナムらしい落ち着いた内装。マッサージのほか、ハーブスチームやボディ・フェイシャルケアも受けられる。",
    descriptionEn:
      "A long-established spa opened in 2003 on Le Thanh Ton, the Japanese street. Traditional Vietnamese atmosphere with massages, herbal steam, and body and facial treatments.",
    catchcopy: "日本人街の老舗スパでゆったり癒やし",
    catchcopyEn: "A classic spa in the heart of the Japanese street",
    tags: ["日本人街", "老舗", "フェイシャル"],
    businessHours: "08:00 - 21:00",
    responseTimeHint: "",
    responseTimeHintEn: "",
    menu: [
      { id: "m-001-1", name: "ボディマッサージ(目安)", nameEn: "Body massage (approx.)", price: 500000, durationMin: 60 },
      { id: "m-001-2", name: "ハーブスチーム+ボディマッサージ(目安)", nameEn: "Herbal steam + body massage (approx.)", price: 900000, durationMin: 90 },
    ],
  }),
  sampleStore({
    id: "store-002",
    category: "spa",
    name: "Mido Luxury Spa",
    area: "Le Thanh Ton",
    address: "160 Lê Thánh Tôn, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    addressEn: "160 Le Thanh Ton St, Ben Thanh Ward, District 1, Ho Chi Minh City",
    lat: 10.7735,
    lng: 106.6985,
    priceRangeMin: 350000,
    priceRangeMax: 900000,
    description:
      "ベンタイン市場近くの大型スパ。ひとり・カップル・家族向けの個室があり、アロマ、タイ古式、ホットストーン、フットマッサージなどメニューが豊富。施術後には自家製ヨーグルトのサービスあり。夜遅くまで営業。",
    descriptionEn:
      "A large spa near Ben Thanh Market with private rooms for solo guests, couples and families. Aromatherapy, Thai, hot stone and foot massage. Homemade yogurt after treatment. Open late.",
    catchcopy: "夜23:30まで営業、メニュー豊富な大型スパ",
    catchcopyEn: "Open until 11:30 PM with a wide menu",
    tags: ["深夜営業", "カップル個室", "ホットストーン"],
    businessHours: "09:00 - 23:30",
    responseTimeHint: "",
    responseTimeHintEn: "",
    menu: [
      { id: "m-002-1", name: "フットマッサージ(目安)", nameEn: "Foot massage (approx.)", price: 350000, durationMin: 60 },
      { id: "m-002-2", name: "アロマボディマッサージ(目安)", nameEn: "Aromatherapy body massage (approx.)", price: 500000, durationMin: 60 },
      { id: "m-002-3", name: "ホットストーンマッサージ(目安)", nameEn: "Hot stone massage (approx.)", price: 700000, durationMin: 90 },
    ],
  }),
  sampleStore({
    id: "store-003",
    category: "massage",
    name: "Golden Lotus Spa & Massage Club",
    area: "Le Thanh Ton",
    address: "15 Thái Văn Lung, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    addressEn: "15 Thai Van Lung St, Ben Nghe Ward, District 1, Ho Chi Minh City",
    lat: 10.7795,
    lng: 106.7043,
    priceRangeMin: 210000,
    priceRangeMax: 700000,
    description:
      "2006年創業。レタントン通りと交差するタイヴァンルン通りにあり、サウナ、フットマッサージ、全身マッサージ、フェイシャルマッサージが受けられる。",
    descriptionEn:
      "Opened in 2006 on Thai Van Lung, just off Le Thanh Ton. Sauna, foot massage, full-body massage and facial massage.",
    catchcopy: "日本人街すぐ、サウナ付きのマッサージ店",
    catchcopyEn: "Massage and sauna steps from the Japanese street",
    tags: ["日本人街", "サウナ", "リーズナブル"],
    businessHours: "09:00 - 23:00",
    responseTimeHint: "",
    responseTimeHintEn: "",
    menu: [
      { id: "m-003-1", name: "フットマッサージ(目安)", nameEn: "Foot massage (approx.)", price: 210000, durationMin: 60 },
      { id: "m-003-2", name: "全身マッサージ(目安)", nameEn: "Full-body massage (approx.)", price: 400000, durationMin: 60 },
    ],
  }),
  sampleStore({
    id: "store-004",
    category: "spa",
    name: "Saigon Heritage Spa & Massage",
    area: "Hai Ba Trung",
    address: "69 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    addressEn: "69 Hai Ba Trung St, Ben Nghe Ward, District 1, Ho Chi Minh City",
    lat: 10.7779,
    lng: 106.7045,
    priceRangeMin: 220000,
    priceRangeMax: 700000,
    description:
      "ハイバーチュン通りのスパ。ボディ、フット、フェイシャルのマッサージを、1区中心部としては手頃な価格帯で受けられる。夜23:30まで営業。",
    descriptionEn:
      "A spa on Hai Ba Trung offering body, foot and facial massage at reasonable prices for central District 1. Open until 11:30 PM.",
    catchcopy: "1区中心部で手頃に、夜遅くまで",
    catchcopyEn: "Affordable massage in central District 1, open late",
    tags: ["深夜営業", "リーズナブル", "フェイシャル"],
    businessHours: "10:00 - 23:30",
    responseTimeHint: "",
    responseTimeHintEn: "",
    menu: [
      { id: "m-004-1", name: "フットマッサージ(目安)", nameEn: "Foot massage (approx.)", price: 280000, durationMin: 60 },
      { id: "m-004-2", name: "ボディマッサージ(目安)", nameEn: "Body massage (approx.)", price: 450000, durationMin: 60 },
      { id: "m-004-3", name: "ボディ+フェイシャル(目安)", nameEn: "Body + facial (approx.)", price: 580000, durationMin: 90 },
    ],
  }),
  sampleStore({
    id: "store-005",
    category: "spa",
    name: "Temple Leaf Spa & Sauna",
    area: "Hai Ba Trung",
    address: "5/7 Nguyễn Siêu, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    addressEn: "5/7 Nguyen Sieu St, Ben Nghe Ward, District 1, Ho Chi Minh City",
    lat: 10.7818,
    lng: 106.7038,
    priceRangeMin: 150000,
    priceRangeMax: 650000,
    description:
      "グエンシュー通りの路地にあるスパ&サウナ。2時間のボディマッサージパッケージにはシャワー、サウナ、スチームルーム、プールの利用が含まれる。クレイマスクやソルトスクラブの追加も可能。",
    descriptionEn:
      "Spa and sauna in an alley off Nguyen Sieu. The 2-hour body massage package includes shower, sauna, steam room and pools, with optional clay mask facial or salt scrub.",
    catchcopy: "サウナ・プール付き、2時間のご褒美パッケージ",
    catchcopyEn: "2-hour package with sauna, steam and pools",
    tags: ["サウナ", "スチーム", "リーズナブル"],
    businessHours: "",
    responseTimeHint: "",
    responseTimeHintEn: "",
    menu: [
      { id: "m-005-1", name: "フットマッサージ(目安)", nameEn: "Foot massage (approx.)", price: 150000, durationMin: 45 },
      { id: "m-005-2", name: "ボディマッサージ2時間パッケージ(サウナ・プール込み)", nameEn: "2-hour body massage package (sauna & pools)", price: 650000, durationMin: 120 },
    ],
  }),
];

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
