import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestOnlyRoute } from '../components/auth/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';


import { AdminRoute } from '../features/admin/AdminRoute';

// Route-level code splitting for optimal initial bundle weight
const LandingPage = lazy(() => import('../features/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const VerifyMagicLinkPage = lazy(() => import('../features/auth/VerifyMagicLinkPage').then(m => ({ default: m.VerifyMagicLinkPage })));
const AdminPanelPage = lazy(() => import('../features/admin/AdminPanelPage').then(m => ({ default: m.AdminPanelPage })));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const QuestsPage = lazy(() => import('../features/quests/QuestsPage').then(m => ({ default: m.QuestsPage })));
const CharacterPage = lazy(() => import('../features/character/CharacterPage').then(m => ({ default: m.CharacterPage })));
const ShopPage = lazy(() => import('../features/shop/ShopPage').then(m => ({ default: m.ShopPage })));
const ThemeMarketplacePage = lazy(() => import('../features/themes/ThemeMarketplacePage').then(m => ({ default: m.ThemeMarketplacePage })));
const ThemeCollectionPage = lazy(() => import('../features/themes/ThemeCollectionPage').then(m => ({ default: m.ThemeCollectionPage })));
const InventoryPage = lazy(() => import('../features/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const FeedbackPage = lazy(() => import('../features/feedback/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const HistoryPage = lazy(() => import('../features/history/HistoryPage').then(m => ({ default: m.HistoryPage })));
const PrivacyPage = lazy(() => import('../features/legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('../features/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const AccessibilityPage = lazy(() => import('../features/legal/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })));
const QuestsInfoPage = lazy(() => import('../features/legal/QuestsPage').then(m => ({ default: m.QuestsPage })));
const RewardsInfoPage = lazy(() => import('../features/legal/RewardsPage').then(m => ({ default: m.RewardsPage })));
const CommunityChatPage = lazy(() => import('../features/chat/CommunityChatPage').then(m => ({ default: m.CommunityChatPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Themes Browse */}
        <Route path="/themes" element={<ThemeMarketplacePage />} />

        {/* Public Legal & Compliance Pages */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/quests" element={<QuestsInfoPage />} />
        <Route path="/rewards" element={<RewardsInfoPage />} />

        {/* Magic Link Verification endpoint */}
        <Route path="/auth/verify" element={<VerifyMagicLinkPage />} />

        {/* Guest-only Auth routes */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Hidden Admin Panel (Strictly protected by server-verified role=ADMIN) */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPanelPage />
            </AdminRoute>
          }
        />

        {/* Direct Route Aliases for Convenient Navigation */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/character" element={<Navigate to="/app/character" replace />} />
        <Route path="/shop" element={<Navigate to="/app/shop" replace />} />
        <Route path="/armory" element={<Navigate to="/app/shop" replace />} />
        <Route path="/inventory" element={<Navigate to="/app/inventory" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        <Route path="/feedback" element={<Navigate to="/app/feedback" replace />} />
        <Route path="/community-chat" element={<Navigate to="/app/community-chat" replace />} />
        <Route path="/chat" element={<Navigate to="/app/community-chat" replace />} />

        {/* Protected Authenticated Routes for Players */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="quests" element={<QuestsPage />} />
            <Route path="character" element={<CharacterPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="armory" element={<ShopPage />} />
            <Route path="themes" element={<ThemeMarketplacePage />} />
            <Route path="themes/collection" element={<ThemeCollectionPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="community-chat" element={<CommunityChatPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
