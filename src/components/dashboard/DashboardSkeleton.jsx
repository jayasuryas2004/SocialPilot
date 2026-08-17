"use client";
import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded-xl w-64"></div>
        <div className="h-4 bg-slate-100 rounded-lg w-96"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={`kpi-skeleton-${i}`} className="bg-slate-200 h-36 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-300 rounded w-24"></div>
              <div className="w-8 h-8 rounded-full bg-slate-300"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-slate-300 rounded w-16"></div>
              <div className="h-3 bg-slate-300 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white h-80 rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="h-5 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-56 bg-slate-100 rounded-2xl w-full"></div>
        </div>
        <div className="xl:col-span-1 bg-white h-80 rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="h-5 bg-slate-200 rounded w-40 mb-4"></div>
          <div className="h-56 bg-slate-100 rounded-full w-48 mx-auto"></div>
        </div>
      </div>

      {/* Bottom Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white h-72 rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="h-5 bg-slate-200 rounded w-44 mb-4"></div>
          <div className="h-48 bg-slate-100 rounded-2xl w-full"></div>
        </div>
        <div className="bg-white h-72 rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="h-5 bg-slate-200 rounded w-44 mb-4"></div>
          <div className="h-48 bg-slate-100 rounded-2xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
