import React from "react";
import { useI18n } from "../i18n/index.jsx";
import DateTimeSlotInput from "./DateTimeSlotInput.jsx";
import AreaMapPicker from "./AreaMapPicker.jsx";

// ジャンルの選択肢は「マッサージ」「エステ」「ベトナム式理髪店」の3つ(+すべてのジャンル)。
// 内部値は既存の店舗データ(category: "massage" | "spa" | "barber")とそのまま対応させる。
const CATEGORIES = ["massage", "spa", "barber"];

export default function SearchFilters({ filters, onChange, onSubmit }) {
  const { t } = useI18n();

  const update = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <form
      className="search-filters"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="search-filters__title">{t("search.title")}</h2>
      <div className="search-filters__grid">
        <label className="field">
          <span className="field__label">{t("search.area")}</span>
          <AreaMapPicker value={filters.area} onChange={(v) => onChange({ ...filters, area: v })} />
        </label>

        <label className="field">
          <span className="field__label">{t("search.category")}</span>
          <select value={filters.category} onChange={update("category")}>
            <option value="">{t("search.categoryAll")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`category.${c}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">{t("search.keyword")}</span>
          <input
            type="text"
            value={filters.keyword}
            onChange={update("keyword")}
            placeholder={t("search.keywordPlaceholder")}
          />
        </label>

        <label className="field">
          <span className="field__label">
            {t("store.requestSlot", { n: 1 })}
          </span>
          <DateTimeSlotInput
            date={filters.date}
            time={filters.time}
            onDateChange={(v) => onChange({ ...filters, date: v })}
            onTimeChange={(v) => onChange({ ...filters, time: v })}
          />
        </label>
      </div>
      <button type="submit" className="btn btn--primary search-filters__submit">
        {t("search.button")}
      </button>
    </form>
  );
}
