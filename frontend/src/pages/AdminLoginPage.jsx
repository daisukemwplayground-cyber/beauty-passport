import React, { useState } from "react";
import { useI18n } from "../i18n/index.jsx";

export default function AdminLoginPage({ onLogin }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await onLogin(password);
      if (!res.ok) {
        setError(t("admin.loginError"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page admin-login">
      <h1>{t("admin.loginTitle")}</h1>
      <p className="hint">{t("admin.loginDesc")}</p>
      <form onSubmit={handleSubmit} className="admin-login__form">
        <label className="field">
          <span className="field__label">{t("admin.password")}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {t("admin.loginButton")}
        </button>
      </form>
    </div>
  );
}
