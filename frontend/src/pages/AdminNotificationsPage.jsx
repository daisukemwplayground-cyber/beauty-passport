import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";

// 店舗管理画面「通知ログ」タブ。
// 実際にメール送信は行っていないため(SMTP認証情報が無い)、承認・却下・来店完了の
// タイミングで生成された「送信されたであろうメール内容」をここで目視確認できるようにする。
export default function AdminNotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listNotifications();
      setNotifications(data.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter
    ? notifications.filter(
        (n) =>
          n.reservationNumber.toLowerCase().includes(filter.toLowerCase()) ||
          (n.to || "").toLowerCase().includes(filter.toLowerCase())
      )
    : notifications;

  return (
    <div className="page admin-notifications">
      <h1>{t("admin.notificationsTitle")}</h1>
      <p className="hint">{t("admin.notificationsDesc")}</p>

      <label className="field notification-filter-field">
        <span className="field__label">{t("admin.notificationsFilter")}</span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="R-0001 / example@..."
        />
      </label>

      {loading && <p className="hint">{t("search.loading")}</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <p className="hint">{t("admin.notificationsNone")}</p>
          ) : (
            <div className="notification-list">
              {filtered.map((n) => (
                <div key={n.id} className="notification-card">
                  <div className="notification-card__header">
                    <span className="notification-card__to">
                      {t("admin.notificationsTo")}: {n.to}
                    </span>
                    <span className="notification-card__sentAt">{new Date(n.sentAt).toLocaleString()}</span>
                  </div>
                  <p className="notification-card__meta hint">
                    {t("admin.reservationNumber")}: {n.reservationNumber}
                  </p>
                  <p className="notification-card__subject">
                    <strong>{t("admin.notificationsSubject")}:</strong> {n.subject}
                  </p>
                  <pre className="notification-card__body">{n.body}</pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
