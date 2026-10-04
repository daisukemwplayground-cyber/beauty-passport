import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ja from "./locales/ja.json";
import en from "./locales/en.json";

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
