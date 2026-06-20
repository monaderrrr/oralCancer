import React from "react";
import { Button } from "../ui/Button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;

  actionLabel?: string;
  onAction?: () => void;

  isLoading?: boolean;

  /**
   * Optional backend state type
   * useful when integrating with API responses
   */
  state?: "empty" | "error" | "loading";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isLoading,
  state = "empty",
}: EmptyStateProps) {
  const showLoading = isLoading || state === "loading";

  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
      
      {/* Icon Section */}
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon
          className={`w-6 h-6 ${
            showLoading ? "animate-spin text-teal-500" : "text-slate-400"
          }`}
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-slate-900 mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {/* Action Button (API-driven) */}
      {actionLabel && onAction && state !== "loading" && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}