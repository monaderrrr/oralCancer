import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppShell } from "../../contexts/AppShellContext";
import type { SupportedLanguage } from "../../i18n";

const languages: Array<{
  code: SupportedLanguage;
  flag: string;
  name: string;
  nativeName: string;
}> = [
  {
    code: "en",
    flag: "🇺🇸",
    name: "English",
    nativeName: "English",
  },
  {
    code: "ar",
    flag: "🇪🇬",
    name: "Arabic",
    nativeName: "العربية",
  },
];

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage, isRTL } = useAppShell();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const currentOption =
    languages.find((language) => language.code === currentLanguage) || languages[0];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = async (language: SupportedLanguage) => {
    if (language !== currentLanguage) {
      await changeLanguage(language);
    }

    setIsOpen(false);
  };

  const focusOption = (index: number) => {
    const normalizedIndex = (index + languages.length) % languages.length;
    optionRefs.current[normalizedIndex]?.focus();
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(focusedIndex + 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(focusedIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusOption(languages.length - 1);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex text-left">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-950/5 transition-colors duration-150 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300 dark:focus-visible:ring-offset-slate-950"
        aria-label={t("languageSwitcher.ariaLabel")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg leading-none transition-transform duration-200" aria-hidden="true">
          {currentOption.flag}
        </span>
        <span className="hidden sm:inline">{currentOption.nativeName}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full z-50 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10 animate-in fade-in slide-in-from-top-1 duration-150 dark:border-slate-700 dark:bg-slate-900 ${
            isRTL ? "left-0" : "right-0"
          }`}
          role="listbox"
          aria-label={t("languageSwitcher.ariaLabel")}
          onKeyDown={handleMenuKeyDown}
        >
          {languages.map((language, index) => {
            const active = language.code === currentLanguage;

            return (
              <button
                key={language.code}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                onClick={() => {
                  void selectLanguage(language.code);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
                    : "text-slate-700 hover:bg-slate-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300"
                }`}
                role="option"
                aria-label={`Switch to ${language.name}`}
                aria-selected={active}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg leading-none" aria-hidden="true">
                    {language.flag}
                  </span>
                  <span>{language.nativeName}</span>
                </span>
                {active && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
