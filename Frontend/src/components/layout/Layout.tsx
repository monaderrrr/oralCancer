import React, { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTopButton } from "./ScrollToTop";

type LayoutProps = {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
};

export function Layout({
  children,
  hideHeader = false,
  hideFooter = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* HEADER */}
      {!hideHeader && <Header />}

      {/* MAIN */}
      <main className="flex-1">{children}</main>

      {/* SCROLL BUTTON */}
      {!hideFooter && <ScrollToTopButton />}

      {/* FOOTER */}
      {!hideFooter && <Footer />}

    </div>
  );
}