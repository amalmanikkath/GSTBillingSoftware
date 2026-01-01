"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Receipt,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Purchase Orders", href: "/purchases", icon: ShoppingCart },
  { name: "Items & Inventory", href: "/items", icon: Package },
  { name: "Customers & Vendors", href: "/contacts", icon: Users },
  { name: "Accounting", href: "/accounting", icon: Receipt },
  { name: "Journal Entries", href: "/journal", icon: ArrowRightLeft },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border/40">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Receipt className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text">GSTNexus</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
             <div className="text-xs font-bold font-mono text-primary">SA</div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">SMS AGRO</p>
            <p className="text-xs text-muted-foreground truncate">smsagro@kunissery.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
