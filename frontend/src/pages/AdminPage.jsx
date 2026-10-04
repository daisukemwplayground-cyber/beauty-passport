import React, { useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useAdminAuth } from "../admin/useAdminAuth.js";
import AdminLoginPage from "./AdminLoginPage.jsx";
import AdminDashboardPage from "./AdminDashboardPage.jsx";
import AdminStoreEditPage from "./AdminStoreEditPage.jsx";
import AdminNotificationsPage from "./AdminNotificationsPage.jsx";

export default function AdminPage() {
  const { t } = useI18n();
  const { isLoggedIn, login, logout } = useAdminAuth();
  const [tab, setTab] = useState("reservations");

  if (!isLoggedIn) {
    return <AdminLoginPage onLogin={login} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__tabs">
        <button
          type="button"
          className={`tab-btn ${tab === "reservations" ? "tab-btn--active" : ""}`}
          onClick={() => setTab("reservations")}
        >
          {t("admin.dashboardTitle")}
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === "store" ? "tab-btn--active" : ""}`}
          onClick={() => setTab("store")}
        >
          {t("admin.storeEditTitle")}
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === "notifications" ? "tab-btn--active" : ""}`}
          onClick={() => setTab("notifications")}
        >
          {t("admin.notificationsTab")}
        </button>
        <button type="button" className="tab-btn tab-btn--logout" onClick={logout}>
          {t("admin.logout")}
        </button>
      </div>

      {tab === "reservations" && <AdminDashboardPage />}
      {tab === "store" && <AdminStoreEditPage />}
      {tab === "notifications" && <AdminNotificationsPage />}
    </div>
  );
}
