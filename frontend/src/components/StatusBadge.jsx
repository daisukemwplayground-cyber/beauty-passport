import React from "react";
import { useI18n } from "../i18n/index.jsx";

export default function StatusBadge({ status }) {
  const { t } = useI18n();
  return <span className={`status-badge status-badge--${status}`}>{t(`status.${status}`)}</span>;
}
