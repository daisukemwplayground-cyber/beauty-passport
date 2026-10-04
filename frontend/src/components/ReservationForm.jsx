import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";
import StatusBadge from "./StatusBadge.jsx";
import DateTimeSlotInput from "./DateTimeSlotInput.jsx";

const emptySlot = { date: "", time: "" };

export default function ReservationForm({ store, initialDate, initialTime }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [menuIds, setMenuIds] = useState([]);
  const [slots, setSlots] = useState([
    { date: initialDate || "", time: initialTime || "" },
    { ...emptySlot },
    { ...emptySlot },
  ]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggleMenu = (id) => {
    setMenuIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const updateSlotValue = (idx, field) => (value) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const preferredSlots = slots.filter((s) => s.date && s.time);
    if (preferredSlots.length === 0) {
      setError(lang === "en" ? "Please enter at least one preferred date/time." : "希望日時を少なくとも1件入力してください。");
      return;
    }
    if (!name || !email) {
      setError(lang === "en" ? "Name and email are required." : "お名前・メールアドレスは必須です。");
      return;
    }
    if (contact && !/^[0-9+\-\s()]{6,20}$/.test(contact.trim())) {
      setError(
        lang === "en"
          ? "Please enter a valid phone number (digits, spaces, +, - only)."
          : "電話番号は数字・スペース・+・-のみで6〜20文字で入力してください。"
      );
      return;
    }

    setSubmitting(true);
    try {
      const reservation = await api.createReservation({
        storeId: store.id,
        customerName: name,
        customerContact: contact,
        customerEmail: email,
        partySize: Number(partySize) || 1,
        preferredSlots,
        menuRequested: menuIds,
        note,
      });
      setResult(reservation);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="reservation-success">
        <h3>{t("store.requestSuccessTitle")}</h3>
        <p>{t("store.requestSuccessBody", { number: result.reservationNumber })}</p>
        <p>
          {t("admin.status")}: <StatusBadge status={result.status} />
        </p>
        <p className="hint">{t("store.requestLookupHint")}</p>
        <p>
          <Link to="/reservations/lookup" className="btn btn--secondary">
            {t("store.requestLookupLink")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <h3>{t("store.requestFormTitle")}</h3>
      <p className="hint">{t("store.requestFormDesc")}</p>

      <label className="field">
        <span className="field__label">{t("store.requestName")}</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label className="field">
        <span className="field__label">{t("store.requestEmail")}</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label className="field">
        <span className="field__label">{t("store.requestContact")}</span>
        <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
      </label>

      <label className="field">
        <span className="field__label">{t("store.requestPartySize")}</span>
        <input type="number" min={1} max={10} value={partySize} onChange={(e) => setPartySize(e.target.value)} />
      </label>

      <fieldset className="field">
        <legend className="field__label">{t("store.requestMenu")}</legend>
        <div className="menu-checkbox-list">
          {store.menu.map((m) => (
            <label key={m.id} className="menu-checkbox">
              <input type="checkbox" checked={menuIds.includes(m.id)} onChange={() => toggleMenu(m.id)} />
              {lang === "en" ? m.nameEn : m.name} ({m.price.toLocaleString()} VND)
            </label>
          ))}
        </div>
      </fieldset>

      {slots.map((slot, idx) => (
        <div className="field field--slot" key={idx}>
          <span className="field__label">
            {t("store.requestSlot", { n: idx + 1 })}
            {idx > 0 && ` ${t("store.requestSlotOptional")}`}
          </span>
          <DateTimeSlotInput
            date={slot.date}
            time={slot.time}
            onDateChange={updateSlotValue(idx, "date")}
            onTimeChange={updateSlotValue(idx, "time")}
          />
        </div>
      ))}

      <label className="field">
        <span className="field__label">{t("store.requestNote")}</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
      </label>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? t("store.requestSubmitting") : t("store.requestSubmit")}
      </button>
    </form>
  );
}
