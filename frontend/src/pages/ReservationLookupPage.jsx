import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";

// 顧客向け予約照会ページ。
// 予約番号 + メールアドレスの組み合わせでのみ、自分の予約状況を確認できる
// (どちらか片方だけでは他人の予約が見えてしまうため、バックエンド側で必ず両方を突き合わせている)。
export default function ReservationLookupPage() {
  const { t } = useI18n();
  const [reservationNumber, setReservationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const data = await api.lookupReservation(reservationNumber.trim(), email.trim());
      setResult(data);
    } catch (err) {
      setError(err.status === 404 ? t("lookup.notFound") : err.message);
    } finally {
      setSubmitting(false);
      setSearched(true);
    }
  };

  return (
    <div className="page reservation-lookup">
      <h1>{t("lookup.title")}</h1>
      <p className="hint">{t("lookup.desc")}</p>

      <form className="reservation-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">{t("lookup.reservationNumber")}</span>
          <input
            type="text"
            value={reservationNumber}
            onChange={(e) => setReservationNumber(e.target.value)}
            placeholder="R-0001"
            required
          />
        </label>
        <label className="field">
          <span className="field__label">{t("lookup.email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? t("store.requestSubmitting") : t("lookup.submit")}
        </button>
      </form>

      {searched && !error && result && (
        <div className="reservation-success lookup-result">
          <h3>
            {t("admin.reservationNumber")}: {result.reservation.reservationNumber}
          </h3>
          <p>
            {t("admin.status")}: <StatusBadge status={result.reservation.status} />
          </p>
          <p>
            <strong>{t("admin.store")}:</strong> {result.store ? result.store.name : result.reservation.storeId}
          </p>
          {result.store?.address && (
            <p>
              <strong>{t("store.address")}:</strong> {result.store.address}
            </p>
          )}
          {result.store?.businessHours && (
            <p>
              <strong>{t("store.businessHours")}:</strong> {result.store.businessHours}
            </p>
          )}
          <p>
            <strong>{t("admin.preferredSlots")}:</strong>{" "}
            {result.reservation.preferredSlots.map((s) => `${s.date} ${s.time}`).join(" / ")}
          </p>
          {result.reservation.confirmedSlot && (
            <p>
              <strong>{t("admin.confirmedSlot")}:</strong> {result.reservation.confirmedSlot.date}{" "}
              {result.reservation.confirmedSlot.time}
            </p>
          )}
          {result.reservation.note && (
            <p>
              <strong>{t("admin.note")}:</strong> {result.reservation.note}
            </p>
          )}
        </div>
      )}

      <p className="hint lookup-back">
        <Link to="/">{t("store.backToSearch")}</Link>
      </p>
    </div>
  );
}
