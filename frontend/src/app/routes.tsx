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
import { SettingsPage } from '../features/settings/SettingsPage';
import { PlaceholderPage } from '../features/placeholder/PlaceholderPage';
import { Store, History } from 'lucide-react';

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
          <Route
            path="armory"
            element={
              <PlaceholderPage
                title="The Armory & Economy"
                phase="Phase 6"
                description="A virtual marketplace where adventurers spend hard-earned Gold on cosmetic UI themes, avatar frames, and milestone relics."
                icon={Store}
                upcomingFeatures={[
                  'Shop catalog verified from PostgreSQL database',
                  'Atomic purchase transactions checking wallet balance server-side',
                  'Persistent user inventory and cosmetic equipment',
                  'Unlockable HUD themes dynamically modifying CSS variables',
                  'Duplicate purchase prevention and anti-cheat validation',
                ]}
              />
            }
          />
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
