"use client";

import React from "react";
import Link from "next/link";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "yellow" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const renderButton = (
    btn: NonNullable<EmptyStateProps["action"]>,
    isPrimary: boolean
  ) => {
    const variantClass = {
      primary: "nordic-btn-primary",
      yellow: "nordic-btn-yellow",
      outline: "nordic-btn-outline",
    }[btn.variant || (isPrimary ? "primary" : "outline")];

    const className = `${variantClass} text-xs sm:text-sm font-bold h-11 px-5 tap-active min-w-[140px]`;

    if (btn.href) {
      return (
        <Link href={btn.href} className={className}>
          {btn.label}
        </Link>
      );
    }

    return (
      <button type="button" onClick={btn.onClick} className={className}>
        {btn.label}
      </button>
    );
  };

  return (
    <div className="nordic-card rounded-2xl sm:rounded-[4px] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto border border-[#DFDFDF]">
      <div
        className="w-14 h-14 rounded-full bg-[#003399]/10 text-[#003399] flex items-center justify-center mb-4 text-2xl"
        aria-hidden="true"
      >
        {icon || (
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#111111] mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#484848] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && renderButton(action, true)}
          {secondaryAction &&
            renderButton(
              {
                label: secondaryAction.label,
                onClick: secondaryAction.onClick,
                href: secondaryAction.href,
                variant: "outline",
              },
              false
            )}
        </div>
      )}
    </div>
  );
}
