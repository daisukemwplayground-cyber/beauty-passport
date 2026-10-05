// エリアの内部値(value)は既存の検索API(area クエリの部分一致)と揃えるため変更しない。
// 表示ラベルは i18n の area.* キー経由でカタカナ表記にする。
// AreaMapPicker.jsx(地図上の座標つき)と、店舗の新規追加・編集フォームの両方から参照する。
export const AREAS = [
  { value: "Le Thanh Ton", key: "leThanhTon" },
  { value: "Dong Khoi", key: "dongKhoi" },
  { value: "Pasteur", key: "pasteur" },
  { value: "Hai Ba Trung", key: "haiBaTrung" },
  { value: "Thi Sach", key: "thiSach" },
  { value: "Ben Thanh", key: "benThanh" },
  { value: "Pham Ngu Lao", key: "phamNguLao" },
  { value: "Tan Dinh", key: "tanDinh" },
];

// 店舗の area(内部値)から表示ラベルの i18n キーを返す。未知のエリアは null(内部値をそのまま表示する)。
export function areaLabelKey(value) {
  const area = AREAS.find((a) => a.value === value);
  return area ? `area.${area.key}` : null;
}
