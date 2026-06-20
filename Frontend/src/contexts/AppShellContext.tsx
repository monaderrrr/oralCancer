import React, { createContext, ReactNode, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY, SupportedLanguage } from "../i18n";
import { loadingController } from "../lib/loadingController";

type AppShellContextValue = {
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isGlobalLoading: boolean;
  isRTL: boolean;
  toggleLanguage: () => Promise<void>;
};

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const isGlobalLoading = useSyncExternalStore(
    loadingController.subscribe,
    loadingController.getSnapshot,
    loadingController.getSnapshot
  );

  const currentLanguage = (i18n.resolvedLanguage === "ar" ? "ar" : "en") as SupportedLanguage;
  const isRTL = currentLanguage === "ar";

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", isRTL);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  }, [currentLanguage, isRTL]);

  const value = useMemo<AppShellContextValue>(
    () => ({
      changeLanguage: async (language) => {
        await i18n.changeLanguage(language);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      },
      currentLanguage,
      isGlobalLoading,
      isRTL,
      toggleLanguage: async () => {
        const nextLanguage: SupportedLanguage = currentLanguage === "en" ? "ar" : "en";
        await i18n.changeLanguage(nextLanguage);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
    }),
    [currentLanguage, i18n, isGlobalLoading, isRTL]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShell must be used inside AppShellProvider");
  }

  return context;
}
