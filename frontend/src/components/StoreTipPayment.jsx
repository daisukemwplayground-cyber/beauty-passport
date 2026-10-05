import React from "react";
import { useI18n } from "../i18n/index.jsx";

// チップ込みかどうか・支払い方法の表示(一覧カードと詳細ページで共用)。未設定の項目は「要確認」と出す。
export default function StoreTipPayment({ store, className = "" }) {
  const { t } = useI18n();
  const tip =
    store.tipIncluded === true ? t("store.tipIncluded") : store.tipIncluded === false ? t("store.tipNotIncluded") : t("store.unconfirmed");
  const methods = store.paymentMethods || [];
  const payment = methods.length > 0 ? methods.map((m) => t(`payment.${m}`)).join(" / ") : t("store.unconfirmed");

  return (
    <dl className={`store-tip-payment ${className}`}>
      <div>
        <dt>{t("store.tip")}</dt>
        <dd>{tip}</dd>
      </div>
      <div>
        <dt>{t("store.payment")}</dt>
        <dd>{payment}</dd>
      </div>
    </dl>
  );
}
