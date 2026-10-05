// モックAPIクライアント。Vite の dev server プロキシ経由で /api -> http://localhost:4000 に転送される。
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    const message = body?.error || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  health: () => request("/health"),

  searchStores: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    ).toString();
    return request(`/stores${qs ? `?${qs}` : ""}`);
  },
  getCategories: () => request("/stores/categories"),
  getRates: () => request("/rates"),
  getStore: (id) => request(`/stores/${id}`),
  createStore: (data) => request("/stores", { method: "POST", body: JSON.stringify(data) }),
  updateStore: (id, data) => request(`/stores/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // ファイルアップロードはContent-Typeをブラウザに任せる必要があるため、共通の request() は使わない。
  uploadStorePhoto: async (id, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${BASE}/stores/${id}/photos`, { method: "POST", body: formData });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(body?.error || `HTTP ${res.status}`);
    }
    return body;
  },
  removeStorePhoto: (id, photoUrl) =>
    request(`/stores/${id}/photos`, { method: "DELETE", body: JSON.stringify({ photo: photoUrl }) }),

  listReservations: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    ).toString();
    return request(`/reservations${qs ? `?${qs}` : ""}`);
  },
  getReservation: (id) => request(`/reservations/${id}`),
  createReservation: (data) => request("/reservations", { method: "POST", body: JSON.stringify(data) }),
  updateReservationStatus: (id, status, extra = {}) =>
    request(`/reservations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, ...extra }) }),
  confirmVisitShop: (id) => request(`/reservations/${id}/confirm-visit/shop`, { method: "POST" }),
  confirmVisitCustomer: (id, visited) =>
    request(`/reservations/${id}/confirm-visit/customer`, { method: "POST", body: JSON.stringify({ visited }) }),
  lookupReservation: (reservationNumber, email) =>
    request("/reservations/lookup", { method: "POST", body: JSON.stringify({ reservationNumber, email }) }),

  adminLogin: (password) => request("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),

  listNotifications: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    ).toString();
    return request(`/notifications${qs ? `?${qs}` : ""}`);
  },
};
