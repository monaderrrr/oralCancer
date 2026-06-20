import React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppShell } from "../../contexts/AppShellContext";

export function GlobalLoadingOverlay() {
  const { t } = useTranslation();
  const { isGlobalLoading } = useAppShell();

  if (!isGlobalLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-slate-800 shadow-xl">
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
        <span className="text-sm font-medium">{t("loading.message")}</span>
      </div>
    </div>
  );
}
