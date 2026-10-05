// 店舗のキーワード検索。
//
// - 店名・説明・キャッチコピー・タグ・メニュー名・住所・エリア・ジャンルをまとめて検索対象にする
// - 全角/半角・大文字/小文字・ひらがな/カタカナの違いは吸収する(「ふっと」「ﾌｯﾄ」→「フット」)
// - 同義語グループで日本語/英語/言い換えを吸収する(「足」でも「foot」でも「リフレ」でもフット系がヒット)
// - スペース区切りの複数語は AND 条件

// 同じ意味として扱う語のグループ。どれか1語で検索すると、グループ内のどの語が含まれていてもヒットする。
const SYNONYM_GROUPS = [
  ["マッサージ", "massage", "もみほぐし", "揉み"],
  ["フット", "foot", "足", "足裏", "足つぼ", "足ツボ", "リフレ", "リフレクソロジー", "reflexology"],
  ["ボディ", "body", "全身"],
  ["アロマ", "aroma", "アロマセラピー", "aromatherapy"],
  ["タイ古式", "タイマッサージ", "thai massage"],
  ["指圧", "shiatsu", "ツボ", "acupressure"],
  ["ホットストーン", "hot stone"],
  ["サウナ", "sauna"],
  ["スチーム", "steam"],
  ["フェイシャル", "facial", "顔", "フェイス"],
  ["スクラブ", "scrub"],
  ["ネイル", "nail"],
  ["パッケージ", "package", "セット"],
  ["スパ", "spa", "エステ"],
  ["カップル", "couple", "ペア", "2人"],
  ["日本人街", "japanese street", "レタントン", "le thanh ton"],
  ["深夜", "夜遅く", "late", "夜"],
  ["チップ込み", "tip included", "チップ不要"],
  ["カード", "card", "クレジット", "credit"],
];

// エリア・ジャンルの表示名(frontend の i18n と同じ)。内部値だけでなく表示名でも検索できるようにする。
const AREA_LABELS = {
  "Le Thanh Ton": ["レタントン通り", "レタントン"],
  "Dong Khoi": ["ドンコイ通り", "ドンコイ"],
  Pasteur: ["パスター通り", "パスター"],
  "Hai Ba Trung": ["ハイバーチュン通り", "ハイバーチュン"],
  "Thi Sach": ["ティサック通り", "ティサック"],
};
const CATEGORY_LABELS = {
  massage: ["マッサージ"],
  spa: ["エステ", "スパ"],
  barber: ["ベトナム式理髪店", "理髪店", "barber"],
};

const PAYMENT_LABELS = { cash: "現金 cash", card: "クレジットカード credit card", qr: "QR決済 qr" };

// 全角→半角(NFKC)、小文字化、ひらがな→カタカナ、空白の正規化。
export function normalize(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_GROUPS = SYNONYM_GROUPS.map((group) => group.map(normalize));

// 1語に対して、それ自身と、その語に一致する(または2文字以上で語の一部になっている)同義語グループの語をすべて返す。
// 「足つぼ」が「ツボ」を含むからといって指圧グループまで広げると、無関係な店がヒットするので逆方向の部分一致はしない。
function expandTerm(term) {
  const variants = new Set([term]);
  for (const group of NORMALIZED_GROUPS) {
    if (group.some((w) => w === term || (term.length >= 2 && w.includes(term)))) {
      group.forEach((w) => variants.add(w));
    }
  }
  return [...variants];
}

function searchableText(store) {
  const parts = [
    store.name,
    store.nameVi,
    store.description,
    store.descriptionEn,
    store.catchcopy,
    store.catchcopyEn,
    store.address,
    store.addressEn,
    store.area,
    ...(AREA_LABELS[store.area] || []),
    store.category,
    ...(CATEGORY_LABELS[store.category] || []),
    ...(store.tags || []),
    ...(store.menu || []).flatMap((m) => [m.name, m.nameEn]),
    // チップ・支払い方法の設定値も検索語として拾えるようにする
    store.tipIncluded === true ? "チップ込み tip included" : "",
    ...(store.paymentMethods || []).map((m) => PAYMENT_LABELS[m]),
  ];
  return normalize(parts.filter(Boolean).join(" \n "));
}

export function matchesKeyword(store, keyword) {
  const terms = normalize(keyword).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const text = searchableText(store);
  return terms.every((term) => expandTerm(term).some((v) => text.includes(v)));
}
