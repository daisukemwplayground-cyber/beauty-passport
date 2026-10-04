import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/index.jsx";
import { formatPriceRange } from "../utils/format.js";

// デザイン方針: ①-3(ホットペッパー型・写真/キャッチコピー訴求版、事業計画書.md セクション15で仮決定)を
// 実際のホットペッパービューティーの画面(ユーザー提供のスクリーンショット、2026-09-17)によりに寄せた改訂版。
// 採用した要素: 店名直下の色分けタグチップ、口コミ件数のアイコン付きバッジ、
// 「店名→アクセス→タグ→写真→説明→口コミ」という情報の並び順。
// あえて採用しなかった要素: 「◯分の空席がある時刻」の直接表示。即時予約を前提にした見せ方であり、
// このサービスは非同期のリクエスト制のため、誤解を招かないよう「詳細を見る」/「予約リクエストする」の
// ボタンを維持する(意図的な設計判断)。
const TAG_COLORS = ["a", "b", "c"];

export default function StoreCard({ store }) {
  const { t, lang } = useI18n();
  const catchcopy = lang === "en" ? store.catchcopyEn : store.catchcopy;

  return (
    <div className="store-card">
      <div className="store-card__body store-card__body--top">
        <h3 className="store-card__name">{store.name}</h3>
        <p className="store-card__area">{store.area}</p>
        {store.tags.length > 0 && (
          <div className="store-card__tags">
            {store.tags.slice(0, 3).map((tag, i) => (
              <span key={tag} className={`store-card__tag-chip store-card__tag-chip--${TAG_COLORS[i % TAG_COLORS.length]}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="store-card__photo">
        <div className="store-card__photo-scroll">
          {(store.photos.length > 0 ? store.photos : ["/images/no-photo.svg"]).map((src, i) => (
            <img key={`${src}-${i}`} src={src} alt={store.name} loading="lazy" />
          ))}
        </div>
        <span className={`store-card__category-tag store-card__category-tag--${store.category}`}>
          {t(`category.${store.category}`)}
        </span>
      </div>

      <div className="store-card__body">
        {catchcopy && <p className="store-card__catchcopy">{catchcopy}</p>}
        <div className="store-card__meta">
          <span className="store-card__price">
            {formatPriceRange(store.priceRangeMin, store.priceRangeMax)} VND {t("search.priceFrom")}
          </span>
        </div>
        <div className="store-card__actions">
          <Link to={`/stores/${store.id}`} className="btn btn--secondary btn--small">
            {t("store.viewDetail")}
          </Link>
          <Link to={`/stores/${store.id}`} className="btn btn--primary btn--small">
            {t("store.requestCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
