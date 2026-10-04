import React from "react";

// 希望日時の入力パーツ(日付ピッカー + 時・分セレクト)。
// SearchFilters(検索フォーム)・ReservationForm(予約リクエストフォーム)の両方から共通で使う。
// 仕様: 選択できる日付は「当日〜2週間後」まで、時刻は15分刻み(00/15/30/45分)のみ選択可能。
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDateBounds() {
  const today = new Date();
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  return { min: formatDate(today), max: formatDate(twoWeeksLater) };
}

export default function DateTimeSlotInput({ date, time, onDateChange, onTimeChange }) {
  const { min, max } = getDateBounds();
  const [hour = "", minute = ""] = (time || "").split(":");

  const handleHourChange = (e) => {
    const h = e.target.value;
    const m = minute || "00";
    onTimeChange(h ? `${h}:${m}` : "");
  };

  const handleMinuteChange = (e) => {
    const m = e.target.value;
    const h = hour || "00";
    onTimeChange(m ? `${h}:${m}` : "");
  };

  return (
    <div className="field__row datetime-slot">
      <input type="date" value={date} min={min} max={max} onChange={(e) => onDateChange(e.target.value)} />
      <div className="datetime-slot__time">
        <select value={hour} onChange={handleHourChange} aria-label="hour">
          <option value="">--</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="datetime-slot__colon">:</span>
        <select value={minute} onChange={handleMinuteChange} aria-label="minute">
          <option value="">--</option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
