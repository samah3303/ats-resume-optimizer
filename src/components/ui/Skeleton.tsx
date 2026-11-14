"use client";

import React from "react";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-[4px] ${className}`}
      style={style}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="nordic-card rounded-2xl sm:rounded-[4px] p-4 sm:p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-[3px]" />
              <Skeleton className="h-4 w-28 rounded-[3px]" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded-[3px]" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="w-8 h-8 rounded-[4px]" />
            <Skeleton className="w-20 h-6 rounded-[4px]" />
          </div>
        </div>

        <div className="space-y-1.5 my-3">
          <Skeleton className="h-3.5 w-full rounded-[2px]" />
          <Skeleton className="h-3.5 w-5/6 rounded-[2px]" />
        </div>
      </div>

      <div className="pt-3 border-t border-[#DFDFDF] flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32 rounded-[2px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-[4px]" />
          <Skeleton className="h-7 w-16 rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}

export function DashboardMetricSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="nordic-card rounded-2xl sm:rounded-[4px] p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-[2px]" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
      <Skeleton className="h-10 w-24 rounded-[4px]" />
      <Skeleton className="h-3 w-40 rounded-[2px]" />
    </div>
  );
}

export function ProfileSectionSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-[#DFDFDF]">
        <Skeleton className="w-2.5 h-2.5 rounded-full" />
        <Skeleton className="h-5 w-36 rounded-[2px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20 rounded-[2px]" />
          <Skeleton className="h-10 w-full rounded-[4px]" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20 rounded-[2px]" />
          <Skeleton className="h-10 w-full rounded-[4px]" />
        </div>
      </div>
      <div className="space-y-1.5 pt-2">
        <Skeleton className="h-3.5 w-28 rounded-[2px]" />
        <Skeleton className="h-20 w-full rounded-[4px]" />
      </div>
    </div>
  );
}

export function TrackerColumnSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col bg-[#F5F5F5] border border-[#DFDFDF] rounded-xl sm:rounded-[4px] p-3 space-y-3 min-w-[240px]"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#DFDFDF]">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-[2px]" />
        </div>
        <Skeleton className="w-5 h-4 rounded-full" />
      </div>
      <div className="space-y-2.5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-3 bg-white border border-[#DFDFDF] rounded-[4px] space-y-2"
          >
            <Skeleton className="h-4 w-3/4 rounded-[2px]" />
            <Skeleton className="h-3 w-1/2 rounded-[2px]" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-16 rounded-[2px]" />
              <Skeleton className="h-5 w-14 rounded-[3px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24 rounded-[2px]" />
            <Skeleton className="h-7 w-2/3 rounded-[3px]" />
            <Skeleton className="h-4 w-1/3 rounded-[2px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-[4px]" />
            <Skeleton className="h-10 w-28 rounded-[4px]" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#DFDFDF] pb-2">
        <Skeleton className="h-9 w-28 rounded-[4px]" />
        <Skeleton className="h-9 w-32 rounded-[4px]" />
        <Skeleton className="h-9 w-32 rounded-[4px]" />
      </div>

      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-6 space-y-4">
        <Skeleton className="h-5 w-40 rounded-[2px]" />
        <Skeleton className="h-4 w-full rounded-[2px]" />
        <Skeleton className="h-4 w-5/6 rounded-[2px]" />
        <Skeleton className="h-4 w-4/6 rounded-[2px]" />
      </div>
    </div>
  );
}
