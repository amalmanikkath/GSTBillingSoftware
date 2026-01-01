"use client";

import Link from "next/link";
import { Bell, Search, Plus, Command } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex h-full items-center justify-between px-8">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search anything (Cmd+K)"
              className="w-full bg-secondary/50 border border-border/40 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/60 bg-background text-[10px] text-muted-foreground">
              <Command className="w-3 h-3" /> K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/invoices/new">
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          </Link>
          
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-background"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
