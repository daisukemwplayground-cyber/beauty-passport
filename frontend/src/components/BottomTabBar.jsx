import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/index.jsx";

// スマホ幅で表示するアプリ風の下部固定タブバー(ユーザー依頼「ホームページ全体の構成を変える」対応、2026-09-17)。
// PC幅ではヘッダーのアイコン付きナビ(Header.jsx)を使い、この下部タブバーはCSSで非表示にする
// (global.css の @media (max-width: 680px) を参照)。
const TABS = [
  { to: "/", icon: "🔍", labelKey: "nav.search" },
  { to: "/reservations/lookup", icon: "📄", labelKey: "nav.lookup" },
];

export default function BottomTabBar() {
  const { t } = useI18n();
  const location = useLocation();

  return (
    <nav className="bottom-tab-bar" aria-label={t("nav.search")}>
      {TABS.map((tab) => {
        const isActive = tab.to === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.to);
        return (
          <Link key={tab.to} to={tab.to} className={`bottom-tab-bar__item ${isActive ? "is-active" : ""}`}>
            <span className="bottom-tab-bar__icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="bottom-tab-bar__label">{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
