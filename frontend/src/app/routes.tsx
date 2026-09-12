import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ProtectedRoute, GuestOnlyRoute } from '../components/auth/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { QuestsPage } from '../features/quests/QuestsPage';
import { CharacterPage } from '../features/character/CharacterPage';
import { ShopPage } from '../features/shop/ShopPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { PlaceholderPage } from '../features/placeholder/PlaceholderPage';
import { History } from 'lucide-react';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest-only Auth routes (redirects to /app/dashboard if already authenticated) */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="character" element={<CharacterPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="armory" element={<ShopPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route
            path="history"
            element={
              <PlaceholderPage
                title="Chronicles & Activity Log"
                phase="Phase 3"
                description="A tamper-proof historical log tracking completed quests, earned XP events, streak milestones, and ascension dates."
                icon={History}
                upcomingFeatures={[
                  'Chronological timeline grouped by day',
                  'Exact event details: XP awarded, Gold gained, attribute shifts',
                  'Level milestone records',
                  'Audit verification proving real database persistence',
                ]}
              />
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
