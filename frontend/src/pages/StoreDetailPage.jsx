import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";
import ReservationForm from "../components/ReservationForm.jsx";
import { formatVndK, formatVndRangeK, formatJpyFromVnd, formatJpyRangeFromVnd } from "../utils/format.js";
import { useVndJpyRate } from "../hooks/useVndJpyRate.js";
import StoreTipPayment from "../components/StoreTipPayment.jsx";
import { areaLabelKey } from "../constants/areas.js";

export default function StoreDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t, lang } = useI18n();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const jpyPerVnd = useVndJpyRate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getStore(id)
      .then((data) => {
        if (!cancelled) setStore(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="page">{t("search.loading")}</div>;
  if (error || !store) {
    return (
      <div className="page">
        <p className="error-text">{t("store.notFound")}</p>
        <Link to="/">{t("store.backToSearch")}</Link>
      </div>
    );
  }

  const desc = lang === "en" && store.descriptionEn ? store.descriptionEn : store.description;
  const address = lang === "en" && store.addressEn ? store.addressEn : store.address;
  const responseHint = lang === "en" && store.responseTimeHintEn ? store.responseTimeHintEn : store.responseTimeHint;
  const priceNote = lang === "en" && store.priceNoteEn ? store.priceNoteEn : store.priceNote;
  const areaKey = areaLabelKey(store.area);
  // 「(former District 1)」のような括弧書きはGoogleマップの検索精度を下げるので除き、店名を付けて検索する
  const mapQuery = encodeURIComponent(`${store.name}, ${(store.addressEn || store.address).replace(/\s*\([^)]*\)/g, "")}`);

  return (
    <div className="page store-detail">
      <Link to="/" className="back-link">
        {"< "}
        {t("store.backToSearch")}
      </Link>

      <div className="store-detail__gallery">
        {store.photos.length > 0 ? (
          store.photos.map((p) => <img key={p} src={p} alt={store.name} />)
        ) : (
          <img src="/images/no-photo.svg" alt={store.name} />
        )}
      </div>

      <div className="store-detail__header">
        <span className={`store-card__category-tag store-card__category-tag--${store.category}`}>
          {t(`category.${store.category}`)}
        </span>
        <h1>{store.name}</h1>
        <p className="store-detail__area">{areaKey ? t(areaKey) : store.area}</p>
        <div className="store-detail__meta">
          <span>
            {t("store.priceRange")}:{" "}
            {store.priceRangeMax > 0 ? `${formatVndRangeK(store.priceRangeMin, store.priceRangeMax)} VND` : t("store.unconfirmed")}
            {jpyPerVnd && store.priceRangeMax > 0 &&
              ` ${t("price.jpyApprox", { yen: formatJpyRangeFromVnd(store.priceRangeMin, store.priceRangeMax, jpyPerVnd) })}`}
          </span>
        </div>
        <div className="store-card__tags">
          {store.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="store-detail__description">{desc}</p>

      <section className="store-detail__section">
        <h2>{t("store.menu")}</h2>
        {store.menu.length === 0 && <p className="hint">{t("store.menuUnconfirmed")}</p>}
        <table className="menu-table">
          <tbody>
            {store.menu.map((m) => (
              <tr key={m.id}>
                <td>{lang === "en" ? m.nameEn : m.name}</td>
                <td>{m.durationMin ? `${m.durationMin} min` : "-"}</td>
                <td>
                  {formatVndK(m.price)} VND
                  {jpyPerVnd && (
                    <span className="menu-table__jpy">{t("price.jpyApprox", { yen: formatJpyFromVnd(m.price, jpyPerVnd) })}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {priceNote && <p className="store-detail__price-note">{priceNote}</p>}
        <StoreTipPayment store={store} />
        {jpyPerVnd && store.menu.length > 0 && <p className="hint">{t("price.jpyNote")}</p>}
        <p className="hint">{t("store.infoDisclaimer")}</p>
      </section>

      <section className="store-detail__section">
        <h2>{t("store.mapTitle")}</h2>
        <p>
          {t("store.address")}: {address}
        </p>
        <p>
          {t("store.businessHours")}: {store.businessHours || t("store.unconfirmed")}
        </p>
        {responseHint && (
          <p>
            {t("store.responseTime")}: {responseHint}
          </p>
        )}
        <a
          className="map-link"
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          rel="noreferrer"
        >
          Google Maps →
        </a>
        <div className="store-detail__map-placeholder" aria-hidden="true">
          <span>
            {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
          </span>
        </div>
      </section>

      <section className="store-detail__section">
        <ReservationForm store={store} initialDate={searchParams.get("date")} initialTime={searchParams.get("time")} />
      </section>
    </div>
  );
}
