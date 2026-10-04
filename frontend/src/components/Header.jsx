import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/index.jsx";

export default function Header() {
  const { t, lang, setLang } = useI18n();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          <span className="app-header__logo">BL</span>
          <span className="app-header__title">{t("app.title")}</span>
        </Link>
        <nav className="app-header__nav">
          <div className="app-header__nav-links">
            <Link to="/">
              <span aria-hidden="true">🔍</span> {t("nav.search")}
            </Link>
            <Link to="/reservations/lookup">
              <span aria-hidden="true">📄</span> {t("nav.lookup")}
            </Link>
          </div>
          <button
            type="button"
            className="lang-switch"
            onClick={() => setLang(lang === "ja" ? "en" : "ja")}
            aria-label="Switch language"
          >
            {t("lang.switch")}
          </button>
        </nav>
      </div>
    </header>
  );
}
