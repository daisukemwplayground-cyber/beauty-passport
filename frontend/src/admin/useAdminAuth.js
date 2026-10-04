import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

const TOKEN_KEY = "beautylink_admin_token";

// 簡易な店舗管理画面ログイン状態フック。
// 本番運用向けのセキュリティは想定しておらず、MVPのUXデモ用。
export function useAdminAuth() {
  const [token, setToken] = useState(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const login = useCallback(async (password) => {
    const res = await api.adminLogin(password);
    if (res.ok) {
      setToken(res.token);
      try {
        window.localStorage.setItem(TOKEN_KEY, res.token);
      } catch {
        // ignore
      }
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { isLoggedIn: Boolean(token), login, logout };
}
