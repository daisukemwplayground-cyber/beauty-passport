import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";

const STATUS_FILTERS = ["", "requested", "approved", "visit_pending", "completed", "rejected", "no_show", "cancelled"];

export default function AdminDashboardPage() {
  const { t, lang } = useI18n();
  const [reservations, setReservations] = useState([]);
  const [stores, setStores] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState({});
  const [actionError, setActionError] = useState(null);

  const storeMap = useMemo(() => Object.fromEntries(stores.map((s) => [s.id, s])), [stores]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resList, storeList] = await Promise.all([
        api.listReservations(statusFilter ? { status: statusFilter } : {}),
        api.searchStores({}),
      ]);
      setReservations(resList.results);
      setStores(storeList.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (reservation) => {
    setActionError(null);
    const slot = selectedSlot[reservation.id] || reservation.preferredSlots[0];
    try {
      await api.updateReservationStatus(reservation.id, "approved", { confirmedSlot: slot });
      await load();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const handleTransition = async (reservation, status) => {
    setActionError(null);
    try {
      await api.updateReservationStatus(reservation.id, status);
      await load();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const handleConfirmVisitShop = async (reservation) => {
    setActionError(null);
    try {
      await api.confirmVisitShop(reservation.id);
      await load();
    } catch (e) {
      setActionError(e.message);
    }
  };

  return (
    <div className="page admin-dashboard">
      <h1>{t("admin.dashboardTitle")}</h1>

      <div className="admin-dashboard__filters">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || "all"}
            type="button"
            className={`chip-btn ${statusFilter === s ? "chip-btn--active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s ? t(`status.${s}`) : t("admin.filterAll")}
          </button>
        ))}
      </div>

      {loading && <p className="hint">{t("search.loading")}</p>}
      {error && <p className="error-text">{error}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      {!loading && !error && (
        <>
          {reservations.length === 0 ? (
            <p className="hint">{t("admin.noReservations")}</p>
          ) : (
            <div className="reservation-list">
              {reservations.map((r) => {
                const store = storeMap[r.storeId];
                return (
                  <div key={r.id} className="reservation-card">
                    <div className="reservation-card__header">
                      <span className="reservation-card__number">
                        {t("admin.reservationNumber")}: {r.reservationNumber}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p>
                      <strong>{t("admin.store")}:</strong> {store ? store.name : r.storeId}
                    </p>
                    <p>
                      <strong>{t("admin.customer")}:</strong> {r.customerName}
                      {r.customerContact ? ` (${r.customerContact})` : ""} x{r.partySize} / {r.customerEmail}
                    </p>
                    <p>
                      <strong>{t("admin.preferredSlots")}:</strong>{" "}
                      {r.preferredSlots.map((s) => `${s.date} ${s.time}`).join(" / ")}
                    </p>
                    {r.confirmedSlot && (
                      <p>
                        <strong>{t("admin.confirmedSlot")}:</strong> {r.confirmedSlot.date} {r.confirmedSlot.time}
                      </p>
                    )}
                    {r.note && (
                      <p>
                        <strong>{t("admin.note")}:</strong> {r.note}
                      </p>
                    )}

                    <div className="reservation-card__actions">
                      {r.status === "requested" && (
                        <>
                          <select
                            value={JSON.stringify(selectedSlot[r.id] || r.preferredSlots[0])}
                            onChange={(e) =>
                              setSelectedSlot((prev) => ({ ...prev, [r.id]: JSON.parse(e.target.value) }))
                            }
                          >
                            {r.preferredSlots.map((s, idx) => (
                              <option key={idx} value={JSON.stringify(s)}>
                                {s.date} {s.time}
                              </option>
                            ))}
                          </select>
                          <button type="button" className="btn btn--primary" onClick={() => handleApprove(r)}>
                            {t("admin.approve")}
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger"
                            onClick={() => handleTransition(r, "rejected")}
                          >
                            {t("admin.reject")}
                          </button>
                        </>
                      )}

                      {r.status === "approved" && (
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={() => handleTransition(r, "visit_pending")}
                        >
                          {t("admin.markVisitPending")}
                        </button>
                      )}

                      {r.status === "visit_pending" && (
                        <>
                          <button type="button" className="btn btn--primary" onClick={() => handleConfirmVisitShop(r)}>
                            {t("admin.confirmVisitShop")}
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger"
                            onClick={() => handleTransition(r, "no_show")}
                          >
                            {t("admin.markNoShow")}
                          </button>
                        </>
                      )}
                    </div>

                    {r.status !== "requested" && (
                      <div className="reservation-card__visit-confirmation">
                        <span>
                          {lang === "en" ? "Shop confirmed: " : "店舗確認: "}
                          {r.visitConfirmation.shopConfirmed ? "✓" : "-"}
                        </span>
                        <span>
                          {lang === "en" ? "Customer confirmed: " : "顧客確認: "}
                          {r.visitConfirmation.customerConfirmed ? "✓" : "-"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
