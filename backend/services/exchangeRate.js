// VND→JPY の為替レート取得(店舗カード・詳細の円換算表示用)。
//
// 無料・APIキー不要の open.er-api.com から1日1回程度取得し、メモリにキャッシュする。
// 取得に失敗した場合は FALLBACK_RATE(手動で調べた直近値)を返すので、表示が止まることはない。
const RATE_URL = "https://open.er-api.com/v6/latest/VND";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6時間

// 2026-10-05 時点のレート(1 VND ≈ 0.00609 JPY)。API取得失敗時のみ使う。
const FALLBACK_RATE = { jpyPerVnd: 0.00609, updatedAt: "2026-10-05T00:00:00Z", source: "fallback" };

let cache = null; // { jpyPerVnd, updatedAt, source, fetchedAt }

export async function getVndJpyRate() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }
  try {
    const res = await fetch(RATE_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const jpyPerVnd = body?.rates?.JPY;
    if (typeof jpyPerVnd !== "number" || !(jpyPerVnd > 0)) throw new Error("JPY rate missing");
    const updatedAt = body.time_last_update_unix
      ? new Date(body.time_last_update_unix * 1000).toISOString()
      : new Date().toISOString();
    cache = { jpyPerVnd, updatedAt, source: "open.er-api.com", fetchedAt: Date.now() };
    return cache;
  } catch (err) {
    console.warn(`[exchangeRate] failed to fetch VND/JPY rate: ${err.message}`);
    // 前回取得できた値があればそれを使い続け、なければ固定値。失敗時は10分後に再試行する。
    const base = cache || FALLBACK_RATE;
    cache = { ...base, fetchedAt: Date.now() - CACHE_TTL_MS + 10 * 60 * 1000 };
    return cache;
  }
}
