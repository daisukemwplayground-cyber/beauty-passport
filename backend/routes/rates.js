import { Router } from "express";
import { getVndJpyRate } from "../services/exchangeRate.js";

const router = Router();

// GET /api/rates — { base: "VND", jpyPerVnd, updatedAt, source }
router.get("/", async (_req, res) => {
  const { jpyPerVnd, updatedAt, source } = await getVndJpyRate();
  res.json({ base: "VND", jpyPerVnd, updatedAt, source });
});

export default router;
