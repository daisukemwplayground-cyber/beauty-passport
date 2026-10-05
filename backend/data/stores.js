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
// 営業デモ用の仮データ: ホーチミン中心部(旧1区)に実在するスパ5店舗を、Web上の公開情報
// (公式サイト・Tripadvisor・旅行ガイド等。各店舗の sources 参照)をもとに登録している。店舗との掲載契約はまだ無い。
// - 情報は 2026-10-05 時点の検索結果による。料金・営業時間は店舗に確認するまで「公開情報ベース」の扱い。
// - 口コミ由来の価格など確度の低いものはメニュー名に「(目安)」を付けている。
// - 緯度経度は住所からのおおよその値。写真は未登録(no-photo表示)。
// - 評価・口コミは捏造しないため 0件 のまま。
// - 住所の区(Phường)は2025年7月の行政区再編後の名称。旧「1区(District 1)」も併記している。
// 本番公開前に、各店舗の確認を取るか、このデータを削除すること。
const sampleStore = (fields) => ({
  nameVi: "",
  rating: 0,
  reviewCount: 0,
  photos: [],
  reviews: [],
  tipIncluded: null,
  paymentMethods: [],
  priceNote: "",
  priceNoteEn: "",
  responseTimeHint: "",
  responseTimeHintEn: "",
  feeModel: defaultFeeModel(),
  ...fields,
});

export const stores = [
  sampleStore({
    id: "store-001",
    category: "spa",
    name: "Sen Spa",
    area: "Le Thanh Ton",
    address: "10B1 Lê Thánh Tôn, Phường Sài Gòn (Quận 1 cũ), TP. Hồ Chí Minh",
    addressEn: "10B1 Le Thanh Ton St, Sai Gon Ward (former District 1), Ho Chi Minh City",
    lat: 10.7807,
    lng: 106.7045,
    priceRangeMin: 396000,
    priceRangeMax: 2640000,
    description:
      "2003年創業の老舗スパ。日本人街レタントン通りにあり、ベトナムらしい落ち着いた内装。タイ古式やアロマのボディマッサージ、足ツボ、ハーブスチームやジャクジーを組み合わせた1.5〜4時間のパッケージまでそろう。",
    descriptionEn:
      "A long-established spa opened in 2003 on Le Thanh Ton, the Japanese street, with a traditional Vietnamese atmosphere. Thai and aromatherapy massage, foot acupressure, and 1.5 to 4-hour packages with herbal steam and jacuzzi.",
    catchcopy: "日本人街の老舗スパで、最長4時間のパッケージも",
    catchcopyEn: "A classic spa on the Japanese street, with packages up to 4 hours",
    tags: ["日本人街", "老舗", "パッケージ"],
    businessHours: "09:30 - 22:00(最終受付 21:00)",
    priceNote: "表示価格は税(VAT 10%)・サービス料(5%)別です。",
    priceNoteEn: "Prices exclude 10% VAT and 5% service charge.",
    menu: [
      { id: "m-001-1", name: "足ツボマッサージ", nameEn: "Foot acupressure", price: 396000, durationMin: 60 },
      { id: "m-001-2", name: "ソルトストーン足ツボマッサージ", nameEn: "Foot acupressure with salt stones", price: 495000, durationMin: 60 },
      { id: "m-001-3", name: "タイ古式マッサージ", nameEn: "Traditional Thai massage", price: 660000, durationMin: 60 },
      { id: "m-001-4", name: "アロマセラピーマッサージ", nameEn: "Aromatherapy massage", price: 770000, durationMin: 60 },
      { id: "m-001-5", name: "パッケージ「Oasis」", nameEn: "Package \"Oasis\"", price: 1100000, durationMin: 90 },
      { id: "m-001-6", name: "パッケージ「Traveller's Retreat」", nameEn: "Package \"Traveller's Retreat\"", price: 1320000, durationMin: 120 },
      { id: "m-001-7", name: "パッケージ「Mysterious」", nameEn: "Package \"Mysterious\"", price: 2640000, durationMin: 240 },
    ],
    sources: [
      "https://senspa.com.vn/en/product-category/body-massage-body-care/",
      "https://senspa.com.vn/en/product-category/packages/",
      "https://www.tripadvisor.com/Attraction_Review-g293925-d1987511-Reviews-Sen_Spa-Ho_Chi_Minh_City.html",
    ],
  }),
  sampleStore({
    id: "store-002",
    category: "spa",
    name: "Mido Luxury Spa",
    area: "Le Thanh Ton",
    address: "160 Lê Thánh Tôn, Phường Bến Thành (Quận 1 cũ), TP. Hồ Chí Minh",
    addressEn: "160 Le Thanh Ton St, Ben Thanh Ward (former District 1), Ho Chi Minh City",
    lat: 10.7735,
    lng: 106.6985,
    priceRangeMin: 490000,
    priceRangeMax: 730000,
    description:
      "ベンタイン市場近くの大型スパ。ひとり・カップル・家族向けの個室があり、アロマ、タイ古式、指圧などを組み合わせたオリジナルの「Mido スペシャル」が人気。施術後には自家製ヨーグルトのサービスあり。現金のほか各種クレジットカードが使える。",
    descriptionEn:
      "A large spa near Ben Thanh Market with private rooms for solo guests, couples and families. Known for the Mido Special, a blend of Thai, shiatsu, aroma and sports massage. Homemade yogurt after treatment. Cash and major credit cards accepted.",
    catchcopy: "夜23時まで営業、カード払いもOKの大型スパ",
    catchcopyEn: "Open until 11 PM, credit cards accepted",
    tags: ["夜遅くまで営業", "カップル個室", "カード可"],
    businessHours: "09:00 - 23:00",
    tipIncluded: false,
    paymentMethods: ["cash", "card"],
    priceNote: "チップは別途です(目安: 60分 50,000 VND / 90分 70,000 VND / 120分 100,000 VND)。",
    priceNoteEn: "Tips are not included (guide: 50,000 VND for 60 min / 70,000 for 90 min / 100,000 for 120 min).",
    menu: [
      { id: "m-002-1", name: "アロマセラピーマッサージ", nameEn: "Aromatherapy massage", price: 490000, durationMin: 60 },
      { id: "m-002-2", name: "タイ古式マッサージ", nameEn: "Traditional Thai massage", price: 490000, durationMin: 60 },
      { id: "m-002-3", name: "Mido スペシャルマッサージ", nameEn: "Mido special massage", price: 610000, durationMin: 75 },
      { id: "m-002-4", name: "アロマセラピーマッサージ", nameEn: "Aromatherapy massage", price: 680000, durationMin: 90 },
      { id: "m-002-5", name: "Mido スペシャルマッサージ", nameEn: "Mido special massage", price: 730000, durationMin: 90 },
    ],
    sources: [
      "https://midoluxuryspa.com/massage-body/",
      "https://travelshelper.com/vietnam/ho-chi-minh-city/mido-luxury-spa/",
    ],
  }),
  sampleStore({
    id: "store-003",
    category: "massage",
    name: "Golden Lotus Spa & Massage Club",
    area: "Le Thanh Ton",
    address: "15 Thái Văn Lung, Phường Sài Gòn (Quận 1 cũ), TP. Hồ Chí Minh",
    addressEn: "15 Thai Van Lung St, Sai Gon Ward (former District 1), Ho Chi Minh City",
    lat: 10.7795,
    lng: 106.7043,
    priceRangeMin: 210000,
    priceRangeMax: 990000,
    description:
      "2006年創業。レタントン通りと交差するタイヴァンルン通りにあるマッサージ店。足裏リフレクソロジー、全身マッサージ、アロマ、ホットストーン、フェイシャル、スクラブまでそろい、サウナもある。料金はチップ込みとの口コミが多い。",
    descriptionEn:
      "Opened in 2006 on Thai Van Lung, just off Le Thanh Ton. Foot reflexology, full-body, aromatherapy and hot stone massage, facials and scrubs, plus a sauna. Reviews say prices include tips.",
    catchcopy: "日本人街すぐ、チップ込みで分かりやすい料金",
    catchcopyEn: "Steps from the Japanese street, tip-inclusive prices",
    tags: ["日本人街", "チップ込み", "サウナ"],
    businessHours: "09:00 - 23:00",
    tipIncluded: true,
    menu: [
      { id: "m-003-1", name: "足裏リフレクソロジー(目安)", nameEn: "Foot reflexology (approx.)", price: 315000, durationMin: 60 },
      { id: "m-003-2", name: "フット+背中・肩ホットストーン(目安)", nameEn: "Foot + back & shoulder hot stone (approx.)", price: 375000, durationMin: 90 },
      { id: "m-003-3", name: "アロマセラピーマッサージ(目安)", nameEn: "Aromatherapy massage (approx.)", price: 550000, durationMin: 60 },
    ],
    sources: [
      "https://www.monkeytravel.com/vn/en/product/product_detail.php?product_id=1076866756",
      "https://www.tripadvisor.com/Attraction_Review-g293925-d6864271-Reviews-Golden_Lotus_Spa_Massage_Club-Ho_Chi_Minh_City.html",
    ],
  }),
  sampleStore({
    id: "store-004",
    category: "spa",
    name: "Saigon Heritage Spa & Massage",
    area: "Hai Ba Trung",
    address: "69 Hai Bà Trưng, Phường Sài Gòn (Quận 1 cũ), TP. Hồ Chí Minh",
    addressEn: "69 Hai Ba Trung St, Sai Gon Ward (former District 1), Ho Chi Minh City",
    lat: 10.7779,
    lng: 106.7045,
    priceRangeMin: 220000,
    priceRangeMax: 850000,
    description:
      "ハイバーチュン通りのスパ。ベトナムとタイのハーブの香りを生かしたマッサージが中心で、ボディ、フット、スクラブ、ネイルまで受けられる。英語が通じ、WhatsAppで予約できる。夜23:30まで営業。",
    descriptionEn:
      "A spa on Hai Ba Trung specializing in massage with Vietnamese and Thai herbal aromas, plus body, foot, scrub and nail services. English-speaking staff, bookings via WhatsApp. Open until 11:30 PM.",
    catchcopy: "夜23:30まで、ハーブの香りのマッサージ",
    catchcopyEn: "Herbal-scented massage, open until 11:30 PM",
    tags: ["夜遅くまで営業", "英語OK", "ホットストーン"],
    businessHours: "10:00 - 23:30",
    tipIncluded: true,
    priceNote: "メニュー表上はチップ不要とされています。",
    priceNoteEn: "The menu states that tipping is not required.",
    menu: [
      { id: "m-004-1", name: "フットマッサージ", nameEn: "Foot massage", price: 350000, durationMin: 60 },
      {
        id: "m-004-2",
        name: "Diamond Special(ホットストーン・ボディ60分+スクラブ+シャワー)",
        nameEn: "Diamond Special (60-min hot stone body massage + scrub + shower)",
        price: 850000,
        durationMin: 100,
      },
    ],
    sources: [
      "https://www.tripadvisor.com/Attraction_Review-g293925-d3749935-Reviews-Saigon_Heritage_Spa-Ho_Chi_Minh_City.html",
      "https://foursquare.com/v/saigon-heritage-spa--foot-massage/4febef29e4b0b42a009cc464",
    ],
  }),
  sampleStore({
    id: "store-005",
    category: "spa",
    name: "Temple Leaf Spa & Sauna",
    area: "Le Thanh Ton",
    address: "32 Thái Văn Lung, Phường Sài Gòn (Quận 1 cũ), TP. Hồ Chí Minh",
    addressEn: "32 Thai Van Lung St, Sai Gon Ward (former District 1), Ho Chi Minh City",
    lat: 10.7799,
    lng: 106.7047,
    priceRangeMin: 150000,
    priceRangeMax: 680000,
    description:
      "タイヴァンルン通りのスパ&サウナ。温浴プール、水風呂、ドライサウナ、スチームルームがあり、日本式の座って洗う洗い場もある。マッサージとサウナを組み合わせたセットがお得。料金はチップ・サービス料込み。支払いは現金のみ。",
    descriptionEn:
      "Spa and sauna on Thai Van Lung with a hot pool, cold plunge, dry sauna and steam room, plus Japanese-style seated washing areas. Massage + sauna sets are good value. Prices include tips and service charge. Cash only.",
    catchcopy: "サウナ・水風呂付き、チップ込みのスパ",
    catchcopyEn: "Sauna, cold plunge and tip-inclusive prices",
    tags: ["サウナ", "チップ込み", "現金のみ"],
    businessHours: "10:00 - 23:30",
    tipIncluded: true,
    paymentMethods: ["cash"],
    priceNote: "料金はチップ・サービス料込みです。",
    priceNoteEn: "Prices include tips and service charge.",
    menu: [
      { id: "m-005-1", name: "サウナ&温浴(入浴のみ)", nameEn: "Sauna & hot spa (entry only)", price: 150000, durationMin: null },
      { id: "m-005-2", name: "エクスプレス フットマッサージ", nameEn: "Express foot massage", price: 380000, durationMin: 30 },
      { id: "m-005-3", name: "パゴダ フットマッサージ", nameEn: "Pagoda foot massage", price: 450000, durationMin: 60 },
      { id: "m-005-4", name: "パゴダ ボディマッサージ", nameEn: "Pagoda body massage", price: 470000, durationMin: 60 },
      { id: "m-005-5", name: "パゴダ ボディマッサージ+サウナ&温浴", nameEn: "Pagoda body massage + sauna & hot spa", price: 560000, durationMin: 60 },
      { id: "m-005-6", name: "テンプル フットマッサージ", nameEn: "Temple foot massage", price: 580000, durationMin: 90 },
      { id: "m-005-7", name: "テンプル ボディマッサージ(シャワー付き)", nameEn: "Temple body massage (with shower)", price: 630000, durationMin: 90 },
      { id: "m-005-8", name: "テンプル ボディマッサージ+サウナ&温浴", nameEn: "Temple body massage + sauna & hot spa", price: 680000, durationMin: 90 },
    ],
    sources: [
      "https://templeleafsauna.com/massage-services.html",
      "https://www.tripadvisor.com/Attraction_Review-g293925-d7339849-Reviews-Temple_Leaf_Spa_Sauna-Ho_Chi_Minh_City.html",
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
