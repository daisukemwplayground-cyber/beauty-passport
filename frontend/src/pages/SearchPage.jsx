import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchFilters from "../components/SearchFilters.jsx";
import StoreCard from "../components/StoreCard.jsx";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";

export default function SearchPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    area: searchParams.get("area") || "",
    category: searchParams.get("category") || "",
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || "",
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const runSearch = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchStores({
        keyword: f.keyword,
        area: f.area,
        category: f.category,
      });
      setStores(res.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回ロード + URLクエリ変化時に検索を実行
  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    setSearchParams(params);
    runSearch(filters);
  };

  return (
    <div className="page search-page">
      <section className="hero">
        <h1>{t("app.title")}</h1>
        <p>{t("app.tagline")}</p>
      </section>

      <div className="results-banner">{t("search.resultsBannerLabel")}</div>

      <SearchFilters filters={filters} onChange={setFilters} onSubmit={handleSubmit} />

      <section className="search-results">
        {loading && <p className="hint">{t("search.loading")}</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <>
            <p className="search-results__count">{t("search.resultCount", { count: stores.length })}</p>
            {stores.length === 0 ? (
              <p className="hint">{t("search.noResults")}</p>
            ) : (
              <div className="store-grid">
                {stores.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
