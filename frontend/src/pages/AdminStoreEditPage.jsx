import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { api } from "../api/client.js";
import { AREAS } from "../constants/areas.js";

// ジャンルの選択肢はSearchFilters.jsxと同じ「マッサージ」「エステ」の2つ。
const CATEGORIES = ["massage", "spa", "barber"];
const PAYMENT_METHODS = ["cash", "card", "qr"];

// tipIncluded(true/false/null) と <select> の値の対応
const TIP_TO_SELECT = { true: "included", false: "notIncluded", null: "" };
const SELECT_TO_TIP = { included: true, notIncluded: false, "": null };

function emptyMenuRow() {
  return { id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "", nameEn: "", price: 0, durationMin: 60 };
}

function emptyCreateForm() {
  return { name: "", category: CATEGORIES[0], area: AREAS[0].value, address: "", addressEn: "" };
}

export default function AdminStoreEditPage() {
  const { t } = useI18n();
  const [storeList, setStoreList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    refreshStoreList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshStoreList(selectAfterId) {
    return api.searchStores({}).then((res) => {
      setStoreList(res.results);
      if (selectAfterId) {
        setSelectedId(selectAfterId);
      } else if (res.results.length > 0 && !selectedId) {
        setSelectedId(res.results[0].id);
      }
      return res.results;
    });
  }

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setSavedMsg(false);
    api
      .getStore(selectedId)
      .then((store) =>
        setForm({
          ...store,
          tagsText: store.tags.join(", "),
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateMenuField = (idx, field) => (e) => {
    const value = field === "price" || field === "durationMin" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({
      ...prev,
      menu: prev.menu.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    }));
  };

  const togglePaymentMethod = (method) => (e) =>
    setForm((prev) => {
      const current = prev.paymentMethods || [];
      const next = e.target.checked ? [...current, method] : current.filter((m) => m !== method);
      // 表示順を選択肢の順にそろえる
      return { ...prev, paymentMethods: PAYMENT_METHODS.filter((m) => next.includes(m)) };
    });

  const addMenuRow = () => setForm((prev) => ({ ...prev, menu: [...prev.menu, emptyMenuRow()] }));
  const removeMenuRow = (idx) => setForm((prev) => ({ ...prev, menu: prev.menu.filter((_, i) => i !== idx) }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPhotoError(null);
    try {
      const updated = await api.uploadStorePhoto(form.id, file);
      setForm((prev) => ({ ...prev, photos: updated.photos }));
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handlePhotoDelete = async (photoUrl) => {
    setPhotoError(null);
    try {
      const updated = await api.removeStorePhoto(form.id, photoUrl);
      setForm((prev) => ({ ...prev, photos: updated.photos }));
    } catch (err) {
      setPhotoError(err.message);
    }
  };

  const updateCreateField = (field) => (e) => setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const created = await api.createStore(createForm);
      await refreshStoreList(created.id);
      setShowCreate(false);
      setCreateForm(emptyCreateForm());
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(false);
    try {
      const tags = form.tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const updated = await api.updateStore(form.id, {
        name: form.name,
        category: form.category,
        area: form.area,
        address: form.address,
        addressEn: form.addressEn,
        description: form.description,
        descriptionEn: form.descriptionEn,
        catchcopy: form.catchcopy,
        catchcopyEn: form.catchcopyEn,
        businessHours: form.businessHours,
        tags,
        priceRangeMin: Number(form.priceRangeMin),
        priceRangeMax: Number(form.priceRangeMax),
        menu: form.menu,
        tipIncluded: form.tipIncluded ?? null,
        paymentMethods: form.paymentMethods || [],
      });
      setForm({ ...updated, tagsText: updated.tags.join(", ") });
      setSavedMsg(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page admin-store-edit">
      <h1>{t("admin.storeEditTitle")}</h1>

      <label className="field">
        <span className="field__label">{t("admin.selectStore")}</span>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {storeList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-store-create">
        <button type="button" className="btn btn--secondary btn--small" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? t("admin.createCancel") : t("admin.createNew")}
        </button>

        {showCreate && (
          <form className="admin-store-create__form" onSubmit={handleCreate}>
            <label className="field">
              <span className="field__label">{t("admin.editName")}</span>
              <input type="text" value={createForm.name} onChange={updateCreateField("name")} required />
            </label>
            <div className="field field__row">
              <label className="field">
                <span className="field__label">{t("admin.editCategory")}</span>
                <select value={createForm.category} onChange={updateCreateField("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`category.${c}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">{t("admin.editArea")}</span>
                <select value={createForm.area} onChange={updateCreateField("area")}>
                  {AREAS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {t(`area.${a.key}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field__label">{t("admin.editAddress")}</span>
              <input type="text" value={createForm.address} onChange={updateCreateField("address")} required />
            </label>
            {createError && <p className="error-text">{createError}</p>}
            <button type="submit" className="btn btn--primary btn--small" disabled={creating}>
              {creating ? t("admin.creating") : t("admin.createSubmit")}
            </button>
          </form>
        )}
      </div>

      {loading && <p className="hint">{t("search.loading")}</p>}
      {error && <p className="error-text">{error}</p>}

      {form && !loading && (
        <form className="admin-store-edit__form" onSubmit={handleSave}>
          <label className="field">
            <span className="field__label">{t("admin.editName")}</span>
            <input type="text" value={form.name} onChange={updateField("name")} />
          </label>

          <div className="field field__row">
            <label className="field">
              <span className="field__label">{t("admin.editCategory")}</span>
              <select value={form.category} onChange={updateField("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`category.${c}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">{t("admin.editArea")}</span>
              <select value={form.area} onChange={updateField("area")}>
                {AREAS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {t(`area.${a.key}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span className="field__label">{t("admin.editAddress")}</span>
            <input type="text" value={form.address} onChange={updateField("address")} />
          </label>

          <label className="field">
            <span className="field__label">{t("admin.editDescription")} (JA)</span>
            <textarea value={form.description} onChange={updateField("description")} rows={3} />
          </label>

          <label className="field">
            <span className="field__label">{t("admin.editDescription")} (EN)</span>
            <textarea value={form.descriptionEn} onChange={updateField("descriptionEn")} rows={3} />
          </label>

          <label className="field">
            <span className="field__label">{t("admin.editCatchcopy")} (JA)</span>
            <input type="text" value={form.catchcopy || ""} onChange={updateField("catchcopy")} />
          </label>

          <label className="field">
            <span className="field__label">{t("admin.editCatchcopy")} (EN)</span>
            <input type="text" value={form.catchcopyEn || ""} onChange={updateField("catchcopyEn")} />
          </label>

          <fieldset className="field">
            <legend className="field__label">{t("admin.editPhotos")}</legend>
            <div className="photo-manage-grid">
              {form.photos.map((p) => (
                <div className="photo-manage-item" key={p}>
                  <img src={p} alt="" />
                  <button
                    type="button"
                    className="btn btn--danger btn--small"
                    onClick={() => handlePhotoDelete(p)}
                  >
                    {t("admin.photoDelete")}
                  </button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
            {uploading && <p className="hint">{t("admin.photoUploading")}</p>}
            {photoError && <p className="error-text">{photoError}</p>}
          </fieldset>

          <label className="field">
            <span className="field__label">{t("admin.editBusinessHours")}</span>
            <input type="text" value={form.businessHours} onChange={updateField("businessHours")} />
          </label>

          <label className="field">
            <span className="field__label">{t("admin.editTags")}</span>
            <input type="text" value={form.tagsText} onChange={updateField("tagsText")} />
          </label>

          <div className="field field__row">
            <label className="field">
              <span className="field__label">Price min (VND)</span>
              <input type="number" value={form.priceRangeMin} onChange={updateField("priceRangeMin")} />
            </label>
            <label className="field">
              <span className="field__label">Price max (VND)</span>
              <input type="number" value={form.priceRangeMax} onChange={updateField("priceRangeMax")} />
            </label>
          </div>

          <label className="field">
            <span className="field__label">{t("store.tip")}</span>
            <select
              value={TIP_TO_SELECT[form.tipIncluded ?? null]}
              onChange={(e) => setForm((prev) => ({ ...prev, tipIncluded: SELECT_TO_TIP[e.target.value] }))}
            >
              <option value="">{t("store.unconfirmed")}</option>
              <option value="included">{t("store.tipIncluded")}</option>
              <option value="notIncluded">{t("store.tipNotIncluded")}</option>
            </select>
          </label>

          <fieldset className="field">
            <legend className="field__label">{t("store.payment")}</legend>
            <div className="checkbox-row">
              {PAYMENT_METHODS.map((m) => (
                <label key={m} className="checkbox-row__item">
                  <input
                    type="checkbox"
                    checked={(form.paymentMethods || []).includes(m)}
                    onChange={togglePaymentMethod(m)}
                  />
                  {t(`payment.${m}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field__label">{t("admin.editMenu")}</legend>
            {form.menu.map((m, idx) => (
              <div className="menu-edit-row" key={m.id}>
                <input type="text" placeholder="名前" value={m.name} onChange={updateMenuField(idx, "name")} />
                <input type="text" placeholder="Name (EN)" value={m.nameEn} onChange={updateMenuField(idx, "nameEn")} />
                <input type="number" placeholder="VND" value={m.price} onChange={updateMenuField(idx, "price")} />
                <input type="number" placeholder="min" value={m.durationMin} onChange={updateMenuField(idx, "durationMin")} />
                <button type="button" className="btn btn--danger btn--small" onClick={() => removeMenuRow(idx)}>
                  {t("admin.menuRemoveRow")}
                </button>
              </div>
            ))}
            <button type="button" className="btn btn--secondary btn--small" onClick={addMenuRow}>
              {t("admin.menuAddRow")}
            </button>
          </fieldset>

          <p className="hint">{t("admin.futureFeeNote")}</p>

          {savedMsg && <p className="success-text">{t("admin.saved")}</p>}
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {t("admin.saveButton")}
          </button>
        </form>
      )}
    </div>
  );
}
