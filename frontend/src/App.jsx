import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import BottomTabBar from "./components/BottomTabBar.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import StoreDetailPage from "./pages/StoreDetailPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ReservationLookupPage from "./pages/ReservationLookupPage.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/stores/:id" element={<StoreDetailPage />} />
          <Route path="/reservations/lookup" element={<ReservationLookupPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>BeautyLink Saigon (MVP / Mock Data) — 日本人旅行者向け美容・マッサージ予約プラットフォーム試作</p>
      </footer>
      <BottomTabBar />
    </div>
  );
}
