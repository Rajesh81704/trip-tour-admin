"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Package,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slice";
import api from "@/lib/api";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/users",
    icon: User,
  },
  {
    name: "Packages",
    href: "/packages",
    icon: Package,
  },
  {
    name: "B2B Requests",
    href: "/b2b",
    icon: Send,
  },
  {
    name: "Inquiries",
    href: "/inquires",
    icon: Send,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await api.post("/auth/admin/logout", {});
    dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-background border-r flex flex-col justify-between">
        <div>
          <div className="p-6 font-bold text-xl flex items-center gap-2">
            <Home className="w-6 h-6" />
            Admin Panel
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-6 mx-2 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
