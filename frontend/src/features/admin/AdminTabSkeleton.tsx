import React from 'react';

export const AdminTabSkeleton: React.FC = () => {
  return (
    <div className="cmd-tab-skeleton-wrapper" aria-label="Loading tab content" aria-busy="true">
      {/* Skeleton Hero Header */}
      <div className="cmd-skeleton-hero" />

      {/* Skeleton KPI Metric Cards */}
      <div className="cmd-skeleton-kpi-grid">
        <div className="cmd-skeleton-kpi-card" />
        <div className="cmd-skeleton-kpi-card" />
        <div className="cmd-skeleton-kpi-card" />
        <div className="cmd-skeleton-kpi-card" />
      </div>

      {/* Skeleton Main Workstation Body */}
      <div className="cmd-skeleton-body" />
    </div>
  );
};
