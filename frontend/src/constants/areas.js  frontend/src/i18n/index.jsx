import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ja from "./locales/ja.json";
import en from "./locales/en.json";

// 日本語をメインに、英語切り替えに対応できる最小限のi18nの仕組み。
// 外部ライブラリ(react-i18next等)は使わず、Context + JSON辞書のシンプルな自前実装。
// 将来、全文英訳を追加したり、別言語(ベトナム語など)を足したりする場合は
// locales/ 以下にJSONを追加し、LOCALES に登録するだけで拡張できる。

const LOCALES = { ja, en };
const STORAGE_KEY = "beautylink_lang";

const I18nContext = createContext(null);

function detectInitialLang() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES[saved]) return saved;
  } catch {
    // localStorageが使えない環境(プライベートモード等)では無視してデフォルトへ
  }
  return "ja";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  const setLang = useCallback((next) => {
    if (!LOCALES[next]) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = LOCALES[lang] || LOCALES.ja;
      let str = dict[key] ?? LOCALES.ja[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        }
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
