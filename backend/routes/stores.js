import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { stores, findStoreById, CATEGORIES, nextStoreId, defaultFeeModel } from "../data/stores.js";

const router = Router();

// エリアごとのおおよその中心座標(緯度経度未指定で新規店舗を作る場合のデフォルト値)。
// frontend/src/components/AreaMapPicker.jsx の座標と同じ考え方(既存店舗の緯度経度から算出)。
const AREA_CENTERS = {
  "Le Thanh Ton": { lat: 10.778475, lng: 106.701925 },
  "Dong Khoi": { lat: 10.7765, lng: 106.7033 },
  Pasteur: { lat: 10.7802, lng: 106.6998 },
  "Hai Ba Trung": { lat: 10.7811, lng: 106.7008 },
  "Thi Sach": { lat: 10.7798, lng: 106.7042 },
};

// 店舗写真のアップロード先(バックエンド配下、server.jsで /api/uploads として静的配信する)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("画像ファイルのみアップロードできます"));
    }
    cb(null, true);
  },
});

// GET /api/stores?area=&category=&keyword=&minPrice=&maxPrice=
router.get("/", (req, res) => {
  const { area, category, keyword, minPrice, maxPrice } = req.query;
  let results = [...stores];

  if (category) {
    results = results.filter((s) => s.category === category);
  }
  if (area) {
    const areaLower = area.toLowerCase();
    results = results.filter(
      (s) =>
        s.area.toLowerCase().includes(areaLower) ||
        s.address.toLowerCase().includes(areaLower) ||
        s.addressEn.toLowerCase().includes(areaLower)
    );
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) ||
        s.nameVi.toLowerCase().includes(kw) ||
        s.description.toLowerCase().includes(kw) ||
        s.descriptionEn.toLowerCase().includes(kw) ||
        s.tags.some((t) => t.toLowerCase().includes(kw))
    );
  }
  if (minPrice) {
    results = results.filter((s) => s.priceRangeMax >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter((s) => s.priceRangeMin <= Number(maxPrice));
  }

  // 一覧表示用に軽量化した形で返す(カード表示に必要な項目のみ)
  const summarized = results.map((s) => ({
    id: s.id,
    category: s.category,
    name: s.name,
    nameVi: s.nameVi,
    area: s.area,
    priceRangeMin: s.priceRangeMin,
    priceRangeMax: s.priceRangeMax,
    rating: s.rating,
    reviewCount: s.reviewCount,
    photos: s.photos,
    tags: s.tags,
    catchcopy: s.catchcopy,
    catchcopyEn: s.catchcopyEn,
    responseTimeHint: s.responseTimeHint,
    responseTimeHintEn: s.responseTimeHintEn,
  }));

  res.json({ count: summarized.length, results: summarized });
});

// POST /api/stores — 店舗管理画面からの新規店舗追加
// 作成後は既存の PUT /api/stores/:id や写真アップロードAPIで詳細を編集していく想定のため、
// ここでは検索・表示に最低限必要な項目のみ受け取り、残りは空/デフォルト値で作成する。
router.post("/", (req, res) => {
  const { name, category, area, address, addressEn, priceRangeMin, priceRangeMax, lat, lng } = req.body;

  if (!name || !category || !area || !address) {
    return res.status(400).json({ error: "name, category, area, address は必須です" });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category は次のいずれかである必要があります: ${CATEGORIES.join(", ")}` });
  }

  const center = AREA_CENTERS[area] || { lat: 10.7788, lng: 106.7017 };
  const store = {
    id: nextStoreId(),
    category,
    name,
    nameVi: "",
    area,
    address,
    addressEn: addressEn || address,
    lat: typeof lat === "number" ? lat : center.lat,
    lng: typeof lng === "number" ? lng : center.lng,
    priceRangeMin: Number(priceRangeMin) || 0,
    priceRangeMax: Number(priceRangeMax) || 0,
    rating: 0,
    reviewCount: 0,
    photos: [],
    description: "",
    descriptionEn: "",
    catchcopy: "",
    catchcopyEn: "",
    tags: [],
    businessHours: "",
    responseTimeHint: "",
    responseTimeHintEn: "",
    menu: [],
    reviews: [],
    feeModel: defaultFeeModel(),
  };

  stores.push(store);
  res.status(201).json(store);
});

router.get("/categories", (_req, res) => {
  res.json({ categories: CATEGORIES });
});

// DELETE /api/stores/:id — 実在しない/掲載しない店舗の削除(管理用)
router.delete("/:id", (req, res) => {
  const index = stores.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "store not found" });
  }
  const [removed] = stores.splice(index, 1);
  res.json({ deleted: removed.id });
});

router.get("/:id", (req, res) => {
  const store = findStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "store not found" });
  }
  res.json(store);
});

// PUT /api/stores/:id — 店舗管理画面からの店舗情報・メニュー編集(簡易版)
router.put("/:id", (req, res) => {
  const store = findStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "store not found" });
  }
  if (req.body.category !== undefined && !CATEGORIES.includes(req.body.category)) {
    return res.status(400).json({ error: `category は次のいずれかである必要があります: ${CATEGORIES.join(", ")}` });
  }
  const editableFields = [
    "name",
    "category",
    "area",
    "address",
    "addressEn",
    "lat",
    "lng",
    "description",
    "descriptionEn",
    "catchcopy",
    "catchcopyEn",
    "businessHours",
    "tags",
    "priceRangeMin",
    "priceRangeMax",
    "menu",
  ];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) {
      store[field] = req.body[field];
    }
  }
  res.json(store);
});

// POST /api/stores/:id/photos — 店舗管理画面からの写真アップロード(multipart/form-data, フィールド名 "photo")
router.post("/:id/photos", (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const store = findStoreById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: "store not found" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "photo file is required" });
    }
    const url = `/api/uploads/${req.file.filename}`;
    store.photos.push(url);
    res.status(201).json(store);
  });
});

// DELETE /api/stores/:id/photos — body: { photo: "/api/uploads/xxxx.jpg" }
router.delete("/:id/photos", (req, res) => {
  const store = findStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "store not found" });
  }
  const { photo } = req.body;
  if (!photo) {
    return res.status(400).json({ error: "photo url is required" });
  }
  store.photos = store.photos.filter((p) => p !== photo);
  // 自前アップロード分の実ファイルは削除を試みる(プレースホルダー画像は対象外)
  if (photo.startsWith("/api/uploads/")) {
    fs.unlink(path.join(uploadsDir, path.basename(photo)), () => {});
  }
  res.json(store);
});

export default router;
