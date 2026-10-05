import { useEffect, useState } from "react";
import { api } from "../api/client.js";

// VND→JPY レートを取得する(円換算表示用)。一覧の各カードから呼ばれるため、
// リクエストはページ内で1回だけにしてPromiseを共有する。取得失敗時は null(円表記を出さない)。
let ratePromise = null;

function loadRate() {
  if (!ratePromise) {
    ratePromise = api.getRates().catch(() => {
      ratePromise = null;
      return null;
    });
  }
  return ratePromise;
}

export function useVndJpyRate() {
  const [rate, setRate] = useState(null);
  useEffect(() => {
    let cancelled = false;
    loadRate().then((r) => {
      if (!cancelled && r) setRate(r.jpyPerVnd);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return rate;
}
