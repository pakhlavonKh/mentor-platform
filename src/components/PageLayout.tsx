import { ReactNode } from "react";
import { HeaderNav } from "@/components/HeaderNav";

interface PageLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

export function PageLayout({ children, noPadding }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      <main className={noPadding ? "flex-1" : "flex-1 px-4 sm:px-6 lg:px-8 py-8"}>
        {children}
      </main>
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 GrantPath. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
