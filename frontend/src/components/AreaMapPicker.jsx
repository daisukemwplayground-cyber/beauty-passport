import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "../i18n/index.jsx";

// エリア名(レタントン通り等)だけでは位置関係が分かりづらいという声を受けて追加した、
// 実際の地図(OpenStreetMap、Leaflet)によるエリア選択UI。Google Mapsと違いAPIキー登録が不要。
// 座標は backend/data/stores.js の各店舗の緯度経度から算出したエリアごとのおおよその中心点。
// ベンタイン・ブイビエン・タンディンの3エリアは店舗追加(2026-10-05)に合わせて追加した。
const AREA_POINTS = [
  { value: "Le Thanh Ton", key: "leThanhTon", lat: 10.778475, lng: 106.701925 },
  { value: "Dong Khoi", key: "dongKhoi", lat: 10.7765, lng: 106.7033 },
  { value: "Pasteur", key: "pasteur", lat: 10.7802, lng: 106.6998 },
  { value: "Hai Ba Trung", key: "haiBaTrung", lat: 10.7811, lng: 106.7008 },
  { value: "Thi Sach", key: "thiSach", lat: 10.7798, lng: 106.7042 },
  { value: "Ben Thanh", key: "benThanh", lat: 10.772, lng: 106.6985 },
  { value: "Pham Ngu Lao", key: "phamNguLao", lat: 10.7672, lng: 106.6925 },
  { value: "Tan Dinh", key: "tanDinh", lat: 10.79, lng: 106.6945 },
];

// 全エリアのマーカーが画面に収まるように表示範囲を決める
const BOUNDS = AREA_POINTS.map((a) => [a.lat, a.lng]);

function markerIcon(selected) {
  const size = selected ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span class="area-marker ${selected ? "is-selected" : ""}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function AreaMapPicker({ value, onChange }) {
  const { t } = useI18n();
  const toggle = (v) => onChange(value === v ? "" : v);

  return (
    <div className="area-picker">
      <MapContainer
        bounds={BOUNDS}
        boundsOptions={{ padding: [20, 20] }}
        scrollWheelZoom={false}
        className="area-picker__leaflet"
        aria-label={t("search.area")}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {AREA_POINTS.map((a) => (
          <Marker
            key={a.value}
            position={[a.lat, a.lng]}
            icon={markerIcon(value === a.value)}
            eventHandlers={{ click: () => toggle(a.value) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {t(`area.${a.key}`)}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div className="area-picker__chips">
        <button
          type="button"
          className={`area-picker__chip ${value === "" ? "is-active" : ""}`}
          onClick={() => onChange("")}
        >
          {t("search.areaAll")}
        </button>
        {AREA_POINTS.map((a) => (
          <button
            type="button"
            key={a.value}
            className={`area-picker__chip ${value === a.value ? "is-active" : ""}`}
            onClick={() => toggle(a.value)}
          >
            {t(`area.${a.key}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
