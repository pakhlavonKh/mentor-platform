import { ReactNode } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";

interface PageLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

export function PageLayout({ children, noPadding }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      <main className={noPadding ? "flex-1" : "flex-1 w-full px-4 sm:px-6 lg:px-8 py-8"}>
        {noPadding ? children : <div className="max-w-7xl mx-auto">{children}</div>}
      </main>
      <Footer />
    </div>
  );
}
